var app = angular.module('seevideos', ['ui.router', 'ngSanitize', 'com.2fdevs.videogular', 'com.2fdevs.videogular.plugins.controls', 'com.2fdevs.videogular.plugins.overlayplay', 'com.2fdevs.videogular.plugins.poster']);
var DELAY = 1000; var DEBUG = true;

app.controller('SearchController', function($scope, $timeout, $document, $state, VideoFactory) {
  $scope.working = "";
  $scope.videos = VideoFactory.videos;
  $scope.letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']
  $scope.selected = null;
  
  var timer;
//  var scroloc_1 = 0;
//  var scroloc_2 = 0;
  
  $scope.handleMouseEnter = function(action) {
    DEBUG && console.log('Handling Mouse Enter Event');
    timer = $timeout(function() {
      callAction(action);
    }, action.delay || DELAY);
  }
  
  $scope.handleMouseLeave = function() {
    DEBUG && console.log('Handling Mouse Leave Event');
    $timeout.cancel(timer);
  }
  
  function callAction(action) {
    switch(action.function) {
      case 'letterPressed': 
        letterPressed(action.parameters[0]);
        $scope.selected = null;
        break;
      case 'spacePressed':
        spacePressed();
        $scope.selected = null;
        break;
      case 'backPressed':
        backPressed();
        $scope.selected = null;
        $scope.handleMouseEnter(action);
        break;
      case 'selectVideo': 
        selectVideo(action.parameters[0]);
        break;
      case 'playPressed':
        playPressed();
        break;
//      case 'scroll':
//        scroll(action.parameters[0], action.parameters[1]);
//        action.delay = 1;
//        $scope.handleMouseEnter(action);
//        break;
      default: break;
    }
  }
  
  function letterPressed(index) {
    $scope.working += $scope.letters[index];
  }
  
  function selectVideo(index) {
    $scope.selected = $scope.videos[index];
  }
  
  function spacePressed() {
    $scope.working += " ";
  }
  
  function backPressed() {
    $scope.working = $scope.working.substring(0, $scope.working.length - 1);
  }
  
  function playPressed() {
    VideoFactory.setSelectedVideo($scope.selected);
    $state.go('play');
  }
  
//  // not the best solution. optimize later
//  function scroll_helper(scroloc, id, amount) {
//    scroloc += amount;
//    
//    var target = angular.element(document.getElementById(id));  
//    
//    if(scroloc < 0) scroloc = 0;
//    else if(scroloc > target[0].offsetHeight) scroloc = target[0].offsetHeight;
//    
//    target[0].scrollTop = scroloc;
//    
//    return scroloc;
//  }
//  
//  // not the best solution. optimize later
//  function scroll(id, amount) {
//    if(id == 'scrollable-1') scroloc_1 = scroll_helper(scroloc_1, id, amount);
//    else if(id == 'scrollable-2') scroloc_2 = scroll_helper(scroloc_2, id, amount);
//    else return;
//  }
});
app.controller('PlayController', function($scope, $timeout, $state, $sce, VideoFactory) {
  $scope.selected = VideoFactory.getSelectedVideo();
  $scope.fullscreen = true; 
  $scope.options = false;
  $scope.volume = 0;
  
  var muted = false;
  var oldvol = 0;
  var timer;
  var player = null;
  
  $scope.config = {
      sources: [
          { src: $sce.trustAsResourceUrl("http://static.videogular.com/assets/videos/videogular.mp4"), type: "video/mp4" },
          { src: $sce.trustAsResourceUrl("http://static.videogular.com/assets/videos/videogular.webm"), type: "video/webm" },
          { src: $sce.trustAsResourceUrl("http://static.videogular.com/assets/videos/videogular.ogg"), type: "video/ogg" }
      ],
      tracks: [
          {
              src: "http://www.videogular.com/assets/subs/pale-blue-dot.vtt",
              kind: "subtitles",
              srclang: "en",
              label: "English",
              default: ""
          }
      ],
      theme: "bower_components/videogular-themes-default/videogular.css",
      plugins: {
          poster: "http://www.videogular.com/assets/images/videogular.png"
      },
      autoPlay: true,
  };
  
  $scope.handleMouseEnter = function(action) {
    DEBUG && console.log('Handling Mouse Enter Event');
    timer = $timeout(function() {
      callAction(action);
    }, action.delay || DELAY);
  };
  
  $scope.handleMouseLeave = function() {
    DEBUG && console.log('Handling Mouse Leave Event');
    $timeout.cancel(timer);
  };
  
  $scope.playerLoaded = function(API) {
    player = API;
    $scope.volume = player.volume;
  };
  
  $scope.volumeUpdated = function(volume) {
    $scope.volume = volume;
  };
  
  function callAction(action) {
    switch(action.function) {
      case 'menuPressed':
        menuPressed();
        break;
      case 'playbackPressed': 
        playbackPressed();
        break;
      case 'modifyVolume':
        modifyVolume(action.parameters[0]); // increase or decrease by designated amt
        $scope.handleMouseEnter(action);
        break;
      case 'scrub':
        scrub(action.parameters[0]);
        $scope.handleMouseEnter(action);
        break;
      case 'mutePressed': 
        mutePressed();
        break;
      case 'closePressed':
        closePressed();
        break;
      case 'optionsPressed':
        optionsPressed();
        break;
      case 'refreshPressed':
        refreshPressed();
        break;
      default: break;  
    }
  }
  
  function menuPressed() {
    $scope.fullscreen = !$scope.fullscreen;
    $scope.options = false;
  }
  
  function playbackPressed() {
    if(player == null) return;
    player.playPause();
  }
  
  function modifyVolume(amount) {  
    if(player == null) return;
    
    muted = false;
    var target = player.volume += amount;
    
    if(target > 1) { target = 1 }
    else if(target < 0) { target = 0 }
    
    player.setVolume(target);
  }
  
  function mutePressed() {
    if(player == null) return;
    
    if(muted) { muted = false; player.setVolume(oldvol); oldvol = 0; }
    else { muted = true; oldvol = player.volume; player.setVolume(0); }
  }
  
  function closePressed() {
    $state.go('search');
  }
  
  function optionsPressed() {
    DEBUG && console.log("Options Pressed");
    $scope.options = !$scope.options;
  }
  
  // currently doing 3s 30s 300s
  function scrub(value) {
    if(player == null) return;
    
    var current = (player.currentTime / 1000);
    var total = (player.totalTime / 1000);
    var target = current + value;
    
    DEBUG && console.log("total is " + total);
    DEBUG && console.log("current is " + current);
    DEBUG && console.log("target is " + target);
    
    if(target > total) target = total;
    else if(target < 0) target = 0;
    
    player.seekTime(target);
  }
  
  function refreshPressed() {
    $state.reload();
  }
});

app.factory('VideoFactory', function() {
  var videos = [
    {
      name: "Game of Thrones Season 1 Episode 1",
      description: "This is the best episode ever!",
      duration: "3000",
      img: "img/bb-s1e1.jpg"
    },
    {
      name: "Game of Thrones Season 1 Episode 2",
      description: "This is the best episode ever!",
      duration: "3000",
      img: "img/bb-s1e2.jpg"
    },
    {
      name: "Game of Thrones Season 1 Episode 3",
      description: "This is the best episode ever!",
      duration: "3000",
      img: "img/bb-s1e3.jpg"
    },
    {
      name: "Game of Thrones Season 1 Episode 4",
      description: "This is the best episode ever!",
      duration: "3000",
      img: "img/bb-s1e4.jpg"
    },
        {
      name: "Game of Thrones Season 1 Episode 5",
      description: "This is the best episode ever!",
      duration: "3000",
      img: "img/bb-s1e1.jpg"
    },
    {
      name: "Game of Thrones Season 1 Episode 6",
      description: "This is the best episode ever!",
      duration: "3000",
      img: "img/bb-s1e2.jpg"
    },
    {
      name: "Game of Thrones Season 1 Episode 7",
      description: "This is the best episode ever!",
      duration: "3000",
      img: "img/bb-s1e3.jpg"
    },
    {
      name: "Game of Thrones Season 1 Episode 8",
      description: "This is the best episode ever!",
      duration: "3000",
      img: "img/bb-s1e4.jpg"
    }
  ];
  
  var selected = null;
  var setSelectedVideo = function(video) { selected = video; }
  var getSelectedVideo = function() { return selected }
  
  return {
    videos: videos,
    setSelectedVideo: setSelectedVideo,
    getSelectedVideo: getSelectedVideo
  }
});

/* got online at: https://ciphertrick.com/2015/02/07/live-search-using-custom-filter-in-angular-js/ */
app.filter('search', function() {
  return function(arr, working) {
    if(working == "") return [];

    working = working.toLowerCase();
    var result = [];
  
    angular.forEach(arr, function(item) {
      if(item.name.toLowerCase().indexOf(working) !== -1)
        result.push(item);
    });
        
    return result;
  };
});

app.config(function($stateProvider) {
  $stateProvider.state('search', {
    url: '',
    controller: 'SearchController',
    templateUrl: 'search.html'
  });
  
  $stateProvider.state('play', {
    url: '/play',
    controller: 'PlayController',
    templateUrl: 'play.html'
  });
});