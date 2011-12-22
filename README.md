# hook.io-mdns - Advertise and discover hooks nearby through mDNS

Half the purpose of a distributed event bus (i.e. Hook.io) is to 
distribute over multiple computers, and not just multiple processes.
hook.io-mdns wraps .listen(), .connect() and .start() of the standard hook.io 
`Hook` object so that they "browse" and "advertise" hooks automatically.

In real life, this means you can use hook.io just as usual, but it will
now discover hooks on nearby machines. Sweet isn't it? 

## Installation

Because of a problem with the `mdns` npm package, it must be installed
manually through my own fork.


     git clone git@github.com:emilisto/node_mdns.git
     cd node_mdns && npm install -g

And then

     git clone git@github.com:emilisto/hook.io-mdns.git
     cd hook.io-mdns && npm install -g

( The `-g` flags can prolly be dropped if your NODE_PATH is setup properly, 
haven't gotten my head around this infinitely complicated `npm` thing just 
yet, skills are to come. )

Now the magic part!

     node bin/start

Run this on machine #1, and then on another machine #2. Notice how #2
discovers and connects to #1. To see the magic, close both and run
`node bin/start` in opposite order and see how #2 now takes the role
as listener and #1 connects to #2.

## Todo

* Support finding multiple hooks through some choosing/prioritization mechanism
* Make it possible for one hook to take over the role as listener if the listener host goes down. Look into how hook.io handles this with locally discovered hooks.
* A cool example app
