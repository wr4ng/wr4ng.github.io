# Portfolio

My portfolio and blog created using `zola`. Deployed through Github Pages.

# Theme

I use the `bear` zola theme. It is included in the repo as a git submodule.
After cloning this repo it can be pulled down locally to use it using:
```shell
git submodule update --init --recursive
```

# Nix shell

Dependencies needed to run the project are declared in `flake.nix`.
To use:
```shell
$ nix develop
(nix-shell)$ zola serve
```

# TODO
- [ ] Fix taxonomy links in projects. Links back to blog. Maybe I don't actually need projects, but can just call them blog-posts?
- [ ] Determine: Should I add reading progress bar?
- [ ] Fix links to headers
