var rpmFrame = document.getElementById('rpm-frame')

function setupRpmFrame(subdomain) {
  var rpmHideButton = document.getElementById('rpm-hide-button')
  rpmHideButton.onclick = function () {
    if (document.fullscreenElement) {
      canvasWrapper.requestFullscreen()
    }
    var rpmContainer = document.getElementById('rpm-container')
    rpmContainer.style.display = 'none'
  }

  var rpmFrame = document.getElementById('rpm-frame')
  rpmFrame.src = `https://${
    subdomain != '' ? subdomain : 'demo'
  }.readyplayer.me/avatar?frameApi`

  window.addEventListener('message', subscribe)
  document.addEventListener('message', subscribe)
  function subscribe(event) {
    const json = parse(event)
    if (
      unityGame == null ||
      json?.source !== 'readyplayerme' ||
      json?.eventName == null
    ) {
      return
    }
    // Send web event names to Unity can be useful for debugging. Can safely be removed
    unityGame.SendMessage(
      'DebugPanel',
      'LogMessage',
      `Event: ${json.eventName}`
    )

    // Subscribe to all events sent from Ready Player Me once frame is ready
    if (json.eventName === 'v1.frame.ready') {
      rpmFrame.contentWindow.postMessage(
        JSON.stringify({
          target: 'readyplayerme',
          type: 'subscribe',
          eventName: 'v1.**',
        }),
        '*'
      )
    }
    console.log('event name' + json.eventName)
    // Get avatar GLB URL
    if (json.eventName === 'v1.avatar.exported') {
      hideRpm()
      // Send message to a Gameobject in the current scene
      unityGame.SendMessage(
        'WebAvatarLoader', // Target GameObject name
        'OnWebViewAvatarGenerated', // Name of function to run
        json.data.url
      )
      console.log(`Avatar URL: ${json.data.url}`)
    }

    // Get user id
    if (json.eventName === 'v1.user.set') {
      console.log(`User with id ${json.data.id} set: ${JSON.stringify(json)}`)
    }
  }

  function parse(event) {
    try {
      return JSON.parse(event.data)
    } catch (error) {
      return null
    }
  }
}

function showRpm() {
  var rpmContainer = document.getElementById('rpm-container')
  rpmContainer.style.display = 'block'
}

function hideRpm() {
  var rpmContainer = document.getElementById('rpm-container')
  var rpmFrame = document.getElementById('rpm-frame')
  rpmContainer.style.display = 'none'
  rpmFrame.src = rpmFrame.src
}
