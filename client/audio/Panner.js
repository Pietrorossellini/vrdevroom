import SpatialAudio from './SpatialAudio'

export default function Panner(srcStream) {
  // The passive audio object is for conteracting bugs in chromium
  // (see https://bugs.chromium.org/p/chromium/issues/detail?id=121673).
  // However, even this solution is buggy in mobile Chrome / Samsung Internet / Oculus browser:
  // sometimes the audio is not properly routed through the graph, resulting in loss of panoration.
  this.audioObj = new Audio()
  this.audioObj.srcObject = srcStream
  this.audioObj.muted = true

  const ctx = SpatialAudio.getContext()

  this.srcNode = ctx.createMediaStreamSource(srcStream)
  this.panNode = createPanner()
  this.gainNode = createGain()
  this.compNode = createCompressor()
  this.destNode = ctx.destination

  function createPanner() {
    const panner = ctx.createPanner()
    panner.setPosition(-5, 0, 0)

    return panner
  }

  function createGain() {
    const gain = ctx.createGain()
    gain.gain.value = 1.0

    return gain
  }

  function createCompressor() {
    const comp = ctx.createDynamicsCompressor()
    comp.threshold.value = -55
    comp.knee.value = 30
    comp.ratio.value = 12
    comp.attack.value = 0.01
    comp.release.value = 0.02

    return comp
  }

  this.srcNode
    .connect(this.panNode)
    .connect(this.gainNode)
    .connect(this.compNode)
    .connect(this.destNode)
}

Panner.prototype = {
  disconnect: function() {
    this.compNode.disconnect()
    this.gainNode.disconnect()
    this.panNode.disconnect()
    this.srcNode.disconnect()
    this.audioObj.srcObject = null
  },

  setPosition: function(x, y, z) {
    this.panNode.setPosition(x, y, z)
  }
}
