(function() {
  window.gameToScreen = function(value) {
    return Client.GraphicEngine.camera.scale * value;
  };

  Math.vector_angle = function(A, B) {
    var angle_cos, angle_deg, angle_rad;
    angle_cos = A[0] * B[0] + A[1] * B[1];
    angle_rad = Math.acos(angle_cos);
    angle_deg = angle_rad * 180 / Math.PI;
    return angle_deg;
  };

  Math.normalize = function(v) {
    return [v[0] / Math.pow(Math.pow(v[0], 2) + Math.pow(v[1], 2), 0.5), v[1] / Math.pow(Math.pow(v[0], 2) + Math.pow(v[1], 2), 0.5)];
  };

}).call(this);
