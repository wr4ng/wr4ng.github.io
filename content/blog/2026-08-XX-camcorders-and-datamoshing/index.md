+++
title = "Camcorders and Datamoshing"
date = 2026-07-29
description = ""
draft = true
+++

So, I bought two camcorders.

***- Why did you buy two camcorders?***

Well, because camcorders are really cool!?!

***- But why two?***

Well one of them is better than the other.

***- But then why not just buy the better one?***

Because I also like how the footage of the *worse* one looks[^1].

***- ...***

Yeah I might have a problem.

# What?
Anyway, I bought a Sony DCR-SX30, originally released in 2009, and a Sony CX240, released in 2014. They both look *hella* cool.
What am I using them for? A travel vlog for my friends from our trip to the Faroe Islands. Okay, here there are:

**TODO: INSERT IMAGES*

Here is a short overview of the great capabilities of these artifacts:

| Property     |  Sony DCR-SX30 |              Sony CX240 |
| ------------ | -------------: | ----------------------: |
| Release year |           2009 |                    2014 |
| Resolution   |        720x576 |    1920x1080 (Full HD!) |
| Framerate    |          25fps |                   50fps |
| Video format |         MPEG-2 | AVCHD (MPEG-4 AVC/H264) |
| File format  |         `.mpg` |            `.mts` files |

# Dealing with the media

Both of the video formats are not anymore. One of them was able to be imported in the newest version of DaVinci Resolve,
however I decided to convert both type of files to something easier to work with.

The video files from the newer Sony CX240 was encoded in h264 under the hood, so only the audio needs to be converted and both moved to another container using `ffmpeg`:
```shell
ffmpeg -i "input.mts" -c:v copy -c:a aac -b:a 192k -sn "output.mp4"
```

The files from the Sony DCR-SX30 need a little more work. But `ffmpeg` comes to the rescue again:
```shell
    ffmpeg -i "input.mp4" -c:v libx264 -crf 18 -preset medium -c:a aac -b:a 192k "output.mp4"
```

I did not play around the the `libx264` encoder settings. You could probably get closer to the *original quality*,
but given the 720x576 resolution and relatively low bitrate it probably doesn't matter.

**Side-note:** I am not sure which type of appropriation I am committing by feeling *nostalgic* when using these camcorders,
since I am not old enough to really have used any myself, but there is something about flipping it open and shooting *"instantly"*,
that is different from pulling my phone out of my pocket.

# Datamoshing
Now we have the video files in a format that easy to work with. Not lets deliberately destroy it!

Datamoshing is a type of video glitch effect achieved by exploiting specific video encoding behaviour and removing specific frames.
It is characterized by *"only the moving parts of the video updating"*. I achieved the effect using Avidemux, specifically the old 2.5.4 version of Avidemux[^2].

The process goes like this:

1. Prepare *pre-mosh*

I used DaVinci Resolve to edit together my clip, and export it in h264 `.mp4`. The planning starts here with thinking about what to cut from and to, as this impacts the final datamoshed product.

2. Convert *pre-mosh*

- Import the *pre-mosh* video into Avidemux 2.5.4.
- Select **MPEG-4 ASP (Xvid)** under **Video**.
- Under **Video** select **Configure** > **Frame** and set **Maximum Consecutive B-frames** to 0. This forces only I- and P-frames.
- Export the video.

3. Perform the *mosh*

Import converted video back into Avidemux 2.5.4.
Use the controls to go to each I-frame, press the A-button, go 1 frame forward, press the B-button and then press Delete.

This deletes the I-frame (information frame) which is often present when large parts of the frame changes. This is what causes the effect of areas before a jump-cut persisting and *following* the same motion.
Do this for all I-frames and then export the video and voilà, you have a datamoshed video.

Here is an example from the intro of my travel vlog:

**TODO: INSERT GIF**

# Conclusion

I spent too much time and money on inferior cameras to make a travel vlog for my friends feel more nostalgic. And I learned a little bit about older video formats and codecs in the process. Great success!

# Footnotes
[^1]: Which I of course had to decide before I bought them because I bought both of them from the same, very nice, guy who used to own a video shop. Yeah...
[^2]: Avidemux 2.5.4: [https://sourceforge.net/projects/avidemux/files/avidemux/2.5.4/](https://sourceforge.net/projects/avidemux/files/avidemux/2.5.4/)
