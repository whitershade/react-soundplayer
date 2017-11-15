'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.default = withSoundCloudAudio;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _soundcloudAudio = require('soundcloud-audio');

var _soundcloudAudio2 = _interopRequireDefault(_soundcloudAudio);

var _hoistNonReactStatics = require('hoist-non-react-statics');

var _hoistNonReactStatics2 = _interopRequireDefault(_hoistNonReactStatics);

var _audioStore = require('../utils/audioStore.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

function withSoundCloudAudio(WrappedComponent) {
  var WithSoundCloudAudio = function (_Component) {
    _inherits(WithSoundCloudAudio, _Component);

    function WithSoundCloudAudio(props, context) {
      _classCallCheck(this, WithSoundCloudAudio);

      var _this = _possibleConstructorReturn(this, (WithSoundCloudAudio.__proto__ || Object.getPrototypeOf(WithSoundCloudAudio)).call(this, props, context));

      if (!props.clientId && !props.soundCloudAudio && !props.streamUrl) {
        console.warn('You need to get a clientId from SoundCloud,\n          pass in an instance of SoundCloudAudio\n          or use streamUrl with audio source instead\n          https://github.com/soundblogs/react-soundplayer#examples');
      }

      // Don't create a SoundCloudAudio instance
      // if there is no `window`
      if ('undefined' !== typeof window) {
        if (props.soundCloudAudio) {
          _this.soundCloudAudio = props.soundCloudAudio;
        } else {
          _this.soundCloudAudio = new _soundcloudAudio2.default(props.clientId);
        }
      }

      _this.state = {
        duration: 0,
        currentTime: 0,
        seeking: false,
        playing: false,
        volume: 1,
        isMuted: false
      };
      return _this;
    }

    _createClass(WithSoundCloudAudio, [{
      key: 'componentDidMount',
      value: function componentDidMount() {
        this.mounted = true;
        this.requestAudio();
        this.listenAudioEvents();
      }
    }, {
      key: 'componentWillUnmount',
      value: function componentWillUnmount() {
        this.mounted = false;
        this.soundCloudAudio.unbindAll();
      }
    }, {
      key: 'requestAudio',
      value: function requestAudio() {
        var _this2 = this;

        var soundCloudAudio = this.soundCloudAudio;
        var _props = this.props,
            resolveUrl = _props.resolveUrl,
            streamUrl = _props.streamUrl,
            onReady = _props.onReady,
            _props$preloadType = _props.preloadType,
            preloadType = _props$preloadType === undefined ? 'auto' : _props$preloadType;


        if (streamUrl) {
          soundCloudAudio.preload(streamUrl, preloadType);
        } else if (resolveUrl) {
          soundCloudAudio.resolve(resolveUrl, function (data) {
            if (!_this2.mounted) {
              return;
            }

            _this2.setState(_defineProperty({}, data.tracks ? 'playlist' : 'track', data), function () {
              return onReady && onReady();
            });
          });
        }
      }
    }, {
      key: 'listenAudioEvents',
      value: function listenAudioEvents() {
        var soundCloudAudio = this.soundCloudAudio;

        // https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Media_events

        soundCloudAudio.on('playing', this.onAudioStarted.bind(this));
        soundCloudAudio.on('timeupdate', this.getCurrentTime.bind(this));
        soundCloudAudio.on('loadedmetadata', this.getDuration.bind(this));
        soundCloudAudio.on('seeking', this.onSeekingTrack.bind(this));
        soundCloudAudio.on('seeked', this.onSeekedTrack.bind(this));
        soundCloudAudio.on('pause', this.onAudioPaused.bind(this));
        soundCloudAudio.on('ended', this.onAudioEnded.bind(this));
        soundCloudAudio.on('volumechange', this.onVolumeChange.bind(this));
      }
    }, {
      key: 'onSeekingTrack',
      value: function onSeekingTrack() {
        this.setState({ seeking: true });
      }
    }, {
      key: 'onSeekedTrack',
      value: function onSeekedTrack() {
        this.setState({ seeking: false });
      }
    }, {
      key: 'onAudioStarted',
      value: function onAudioStarted() {
        var soundCloudAudio = this.soundCloudAudio;
        var onStartTrack = this.props.onStartTrack;


        this.setState({ playing: true });

        (0, _audioStore.stopAllOther)(soundCloudAudio.playing);
        (0, _audioStore.addToPlayedStore)(soundCloudAudio);

        onStartTrack && onStartTrack(soundCloudAudio, soundCloudAudio.playing);
      }
    }, {
      key: 'onAudioPaused',
      value: function onAudioPaused() {
        var onPauseTrack = this.props.onPauseTrack;


        this.setState({ playing: false });

        onPauseTrack && onPauseTrack(this.soundCloudAudio);
      }
    }, {
      key: 'onAudioEnded',
      value: function onAudioEnded() {
        var onStopTrack = this.props.onStopTrack;


        this.setState({ playing: false });

        onStopTrack && onStopTrack(this.soundCloudAudio);
      }
    }, {
      key: 'onVolumeChange',
      value: function onVolumeChange() {
        this.setState({
          volume: this.soundCloudAudio.audio.volume,
          isMuted: this.soundCloudAudio.audio.muted
        });
      }
    }, {
      key: 'getCurrentTime',
      value: function getCurrentTime() {
        this.setState({
          currentTime: this.soundCloudAudio.audio.currentTime
        });
      }
    }, {
      key: 'getDuration',
      value: function getDuration() {
        this.setState({
          duration: this.soundCloudAudio.audio.duration
        });
      }
    }, {
      key: 'render',
      value: function render() {
        return _react2.default.createElement(WrappedComponent, _extends({}, this.props, {
          soundCloudAudio: this.soundCloudAudio
        }, this.state));
      }
    }]);

    return WithSoundCloudAudio;
  }(_react.Component);

  WithSoundCloudAudio.displayName = 'withSoundCloudAudio(' + getDisplayName(WrappedComponent) + ')';
  WithSoundCloudAudio.WrappedComponent = WrappedComponent;

  return (0, _hoistNonReactStatics2.default)(WithSoundCloudAudio, WrappedComponent);
}