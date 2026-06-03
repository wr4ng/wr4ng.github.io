+++
title = "The NixOS rabbit hole"
date = 2024-12-30
description = "What happens when you have a little too much time in your vacation and stumbles upon NixOS..."
+++

What happens when you stumble upon NixOS at when you have a little too much available time on your hands? **This** happens.

# Preface

I've been using Arch Linux (*btw*) for this semester on my laptop and have been really happy with my setup. I've been able to solve most of my issues using either the [ArchWiki](https://wiki.archlinux.org/title/Main_page) and the AUR, only having to login to Gnome with X11 instead of Hyprland with Wayland for select applications (I'm looking at you `jspin`[^1] 👀).

**But**, this works best when I only use my personal laptop. Introducing my home desktop PC, which is mostly used for gaming, the setup isn't quite as nice. I'd gotten into a good workflow where (most) of my configuration files are stored in my [dotfiles repo](https://github.com/wr4ng/dotfiles), which are then symlinked to their appropriate location using `stow`. This made it pretty easy to update my `neovim` configuration, commit my changes and then pull them down whenever I got home.

However NixOS takes configuring my system(s) to the next level. Before I dive in, here are some of the amazing resources that inspired me to jump into the rabbit hole, and helped guide my NixOS config in the (hopefully) right direction:

- [No Boilerplate: *NixOS: Everything Everywhere All At Once* (YouTube)](https://www.youtube.com/watch?v=CwfKlX3rA6E)
- [Vimjoyer: *Ultimate NixOS Guide | Flakes | Home-manager* (YouTube)](https://www.youtube.com/watch?v=a67Sv4Mbxmc)  
(Generally the entirety of Vimjoyer's NixOS playlist)
- [The NixOS Wiki](https://wiki.nixos.org/wiki/NixOS_Wiki)
- And a *lot* of ChatGPT/Ollama conversations...  
(ChatGPT seemed to be a little outdated, so not a good resource for getting specific names, but was helpful with Nix syntax)

# The Beginning 
I started by downloading the latest nixos `.iso`, adding it to my [ventoy](https://www.ventoy.net/) drive and installed it on some leftover space on my desktop's drive. I began using Gnome (included in the image I selected) and wanted to setup Nvidia drivers for my RTX 3080. I used the [NixOS Wiki Nvidia entry](https://nixos.wiki/wiki/Nvidia), added the configuration to my `/etc/nixos/configuration.nix`, rebuilt my config and after a reboot, drivers were up and running.

Then I repeated the following steps to get applications up and running:
1. Want to get `some-app` working
2. Search for `some-app` in the [NixOS Wiki](https://wiki.nixos.org/wiki/NixOS_Wiki) or in [nixpkgs](https://search.nixos.org/packages)
3. Add configuration found to `etc/nixos/configuration.nix`  
(i.e. add `some-app` to `environment.SystemPackages` set or configure some other option)
4. Try to rebuild: `nixos-rebuild switch`  
    a. Success! `some-app` is now working!  
    b. Build failed... try to figure out why...

And to be honest, I ran into 4.b. a *lot*. The `nix` language used to configure NixOS is powerful, but It does have a steep learning curve. Being used to `.yaml`, `.json`, `.toml`, etc. ([xkcd/927](https://xkcd.com/927/)) as configuration formats, using a full-blown programming language seems a little crazy. I'm not quite there yet, however I cannot deny it lets you do some pretty cool stuff. I also quite like the idea of thinking of my configuration as a codebase instead of as individual config files.

One of the things I like most about NixOS is that I know that any problem I encounter and solve is *declaratively* solved. Using the same config, I should never run into that problem again. With my previous arch setup, there were times where I would run into a problem, google-fu my way to a solution requiring editing `etc/.../some-file` and/or running `some-command --xyz` and the problem is solved. However, when I would run into the problem again in the case of my desktop PC or setting up a new device, I probably didn't document how I solved it and have to find the solution again. I can probably find the solution faster the second time around, however my experience is that the number of these small tweaks piles up, and I don't want to have to document all of them to be sure I can get back to the same setup.

Using **NixOS**, it's almost as if solving the problem and documenting it is one and the same thing. In Nix, it would look like:
```nix
# Setup some-program to do something
programs.some-program = {
    enable = true;
    some-option = 1234;
    some-other-option = [ "some-value" ];
};
```
Then, if I ever run into any problems with `some-program`, I can `grep` my way to where it's defined and change anything. And if the option related to `some-program` is changed in the future, I'll be notified at the next `nixos-rebuild switch`.

# The Great Refactoring
Setting up everything in `etc/nixos/configuration.nix` works initially, but leaves out one of the most powerful features of using **NixOS**, sharing configuration between devices. This leads to the part of my journey I'll call *The Great Refactoring*. This involved setting my config to use [nix flakes](https://nixos.wiki/wiki/Flakes) and [home-manager](https://github.com/nix-community/home-manager), and moving all configuration into nixos or home-manager modules to be re-used by both my desktop and laptop.

I won't go into details regarding flakes and home-manager (since I don't *really* understand them fully), however after *a lot* of moving nix code around, I had a repository looking something like this:

```tree
> tree
.
├── flake.lock
├── flake.nix
├── hosts
│   ├── desktop
│   │   ├── configuration.nix
│   │   ├── hardware-configuration.nix
│   │   └── home.nix
│   └── yoga
│       ├── configuration.nix
│       ├── hardware-configuration.nix
│       └── home.nix
└── modules
    ├── home-manager
    │   └── ...
    └── nixos
        └── ...
```
Then to rebuild my system, I can use one of the following commands, depending on which device I am using:

```shell
sudo nixos-rebuild switch --flake ~/nixos#desktop
sudo nixos-rebuild switch --flake ~/nixos#yoga
```
An example of a module is `/modules/nixos/gui/steam/default.nix`:
```nix
{ pkgs, lib, config, ... }:

{
  options.programs.gui.steam.enable = lib.mkEnableOption "enables steam";
  config = lib.mkIf config.programs.gui.steam.enable {
    # Install Steam.
    programs.steam.enable = true;
    programs.steam.gamescopeSession.enable = true;
    programs.gamemode.enable = true;

    environment.systemPackages = with pkgs; [
      mangohud
      protonup
    ];

    # Setup protonGE path.
    environment.sessionVariables = {
      STEAM_EXTRA_COMPAT_TOOLS_PATHS = "/home/${config.users.defaultUser}/.steam/root/compatibilitytools.d";
    };
  };
}
```
Here we create a new enable option, `programs.gui.steam.enable`, which then install Steam and some other tools like `protonup` to install Proton-GE versions. I've then enalbed this module in `/hosts/desktop/configuration.nix` by including setting `programs.gui.steam.enable` to `true` (and importing the module).

This enables me to selectively enable which applications/configurations are part of my laptop and desktop, and which are enabled by default on both systems (i.e. 1Password and Discord).

It took a lot of time moving most of my config into modules, maybe I spent a little too much time on it... however it made me understand the nix language better, and there were multiple *aha*-moments where something just clicked and understanding a specific concept allowed simplifying my config.

# The Result
My resulting config is available at https://github.com/wr4ng/nixos. It is not quite *there* yet, but that is probably the blessing and the curse of using NixOS. Below is a screenshot of my resulting setup:

{{ resize_image(path="screenshot.png", width=1920, op="fit_width", format="webp", alt="screenshot of final NixOS setup") }}

# Conclusion
Overall I'm happy with my current setup, even though there are some annoyances. I can miss the simplicity of *"just running a command"* to get something working, without always having to do it the purist nix-way. But whenever I find the solution to a problem I can assure myself that I know that configuration will continue working on any new device.

I will probably continue using nixos until I run into the inevitable problem I cannot solve, and then run back to arch where I can let the AUR solve the problems for me ;))

[^1]: [https://github.com/motib/jspin](https://github.com/motib/jspin)
