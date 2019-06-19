### **Spectrify — A Spotify controller.**

### General Assembly — SEI-31

### **About Spectrify**

Spectrify is a Spotify web controller which looks to add a little spice and bring a clean aesthetic somewhere in between a visualiser and a web controller. It's designed to be run on a secondary external screen (or equivalent) alongside your Spotify app and is influenced by the current popularity of *rgb everything*.

Spectrify is a Rails project which authenticates with Spotify's API through OAuth. Once signed in the user is able to search their playlists and queue the beats. I've done my best to create a minimal interface that will reactively show the things you need, for instance no skip buttons until you move the mouse etc.

### **Learnings**
Spectrify underwent many changes during it's initial 1 week build. My goal was to build a visualiser that took the stream from Spotify, instantaneously ran that through Web Audio API's analyze function resulting in the outputs the values of the audio stream's spectrum using FFT. This data would then be punched into a framework such as p5.js to affect a variety of shapes on screen. I attempted to gain access to/assign the Spotify stream using an endless number of ways however, because Spotify delivers the stream inside an iframe with CORS disabled, I believe that I cannot gain access to the stream directly.

In the second phase I attempted to build out the visualisation using pre-crunched song data. When requested, the response contains a massive object which essentially dictates how the song sounds from a text point of view. However, although it is possible to build a visualisation from this, I found my limit once again in being able to do this on live streaming because of two main factors. The first, being that the API request for that song is a very long response time, which causes a number of 504 time out errors and therefor unreliability. The second foremost reason is that, in the time allotted, I was unsuccessful in trying to discover a way to synchronise the visualisation (from the pulled data) and the currently streaming song, mostly due to being unable to use p5.js and assign the stream the necessary cues from the data points of the returned object.

And so, after much learning I have pivoted towards a web interface controller which doesn't sync or react to the streaming song *yet*, but rather is constantly offering some great visuals, with options to tweak the colours etc to people's preferences. The data flow is still rather complex, offering me a great challenge and opportunity to further my developing skills.

### **Show Me Already**
You can find *Spectrify* at, please note that it is currently still a WIP;
https://spectrify.herokuapp.com

#### Setting up a Prnkstr link.
![Setting up a Prnkstr Link](https://raw.githubusercontent.com/Trigotometry/prnkstr-extension/master/readme%20images/%231%20Prnkstr%20Link.png)
#### Prnkstr Dashboard Login
![Prnkstr Dashboard Login](https://raw.githubusercontent.com/Trigotometry/prnkstr-extension/master/readme%20images/%232%20Prnkstr%20Login.png)
#### List of users to select from.
![List of already made links.](https://raw.githubusercontent.com/Trigotometry/prnkstr-extension/master/readme%20images/%233%20Prnkstr%20Linked%20List.png)
#### Prnkstr Dashboard — Displays list of current DOM manipulation features.
![Prnkstr Dashboard](https://raw.githubusercontent.com/Trigotometry/prnkstr-extension/master/readme%20images/%234%20Prnkstr%20Dashboard.png) -->

### **Potential Updates & Additions.**
<!-- - Opposite day - (change a list of words to their opposite: "is" to "isn't" etc).
- Matrix mode - (rotate all text elements by 90 & change text colour to green, invert whites to black and wrap them in <marquee.> tag. ) -->

**Thank you to both Joel and Yianni for fielding questions.**
