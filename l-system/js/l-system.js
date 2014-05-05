function LSystem(initialState) {
  this.value = initialState;
  this.rules = {};
}

LSystem.prototype.addRule = function(from, to) {
  if (this.rules[from]) throw 'A rule for ' + from + ' exists.';
  this.rules[from] = to;
  return this;
};

LSystem.prototype.step = function(n) {
  if (!n) n = 1;

  for (var i = 0; i < n; i++) {
    var nextValue = '';
    for (var j = 0; j < this.value.length; j++) {
      var c = this.value[j];
      if (this.rules[c]) {
        nextValue += this.rules[c];
      }
      else {
        nextValue += c;
      }
    }
    this.value = nextValue;
  }

  return this.value;
};
