# takin-ui

> A web based UI for ros

## Build Setup

```bash
# install dependencies
npm install

# serve with hot reload
npm run serve

# build for production with minification
npm run build
```

## ROS dependencies

sudo apt install ros-kinetic-rosbridge-suite
sudo apt install ros-kinetic-web-video-server

roslaunch rosbridge_server rosbridge_websocket.launch
rosrun web_video_server web_video_server
