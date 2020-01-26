class Train {
  constructor(wagonCount = 1) {
    this.wagons = this.buildWagons(wagonCount);
    this.path = null; // SVGPathElement
    this.speed = 5;
    this.direction = 0;
  }
  buildWagons(wagonCount = 1) {
    const wagons = new Array(wagonCount).fill(null);
    return wagons.map((n, index) => new Wagon(index + 1));
  }

  /**
   * @param  {SVGSVGElement} railway
   */
  setRailway(railway) {
    this.path = railway.firstElementChild;
    this.path.totalLength = this.path.getTotalLength();
    this.path.isLoop = this.checkPathIsLoop();
    this.path.offset = {
      x: railway.computedStyleMap().get('left').value,
      y:  railway.computedStyleMap().get('top').value
    };
    this.setWagonsOnRailway();
  }
  checkPathIsLoop() {
    const startPoint = this.path.getPointAtLength(0);
    const endPoint = this.path.getPointAtLength(this.path.totalLength);
    return (startPoint.x === endPoint.x && startPoint.y === endPoint.y);
  }
  setWagonsOnRailway() {
    for (const [index, wagon] of this.wagons.entries()) {
      this.run(0);
      this.draw();
    }
  }
  getWidthTrain() {
    return this.wagons.reduce((total, wagon) => {
      return total + wagon.getSize().width;
    }, 0);
  }
  run(n = 0) {
    for (const wagon of this.wagons) {
      const distance = n * this.speed;
      const offset = wagon.getNumber() * wagon.getSize().width;
      let position = distance + offset;
      if (! this.path.isLoop) {
        this.direction = Math.trunc((position) / this.path.totalLength) % 2;
        position = Math.abs(
          (this.path.totalLength * this.direction) - (position % this.path.totalLength)
        );
      } else {
         position = position % this.path.totalLength;
      }
      if (this.direction < 0) {
        position = this.path.totalLength - (position % this.path.totalLength);
      }
      const pointOnPath = this.path.getPointAtLength(position);
      wagon.setVelocity(pointOnPath.x, pointOnPath.y);
    }
    this.draw();
  }
  draw() {
    const fragment = document.createDocumentFragment();
    for (const wagon of this.wagons) {
      const el = wagon.draw(this.path.offset.x, this.path.offset.y);
      fragment.appendChild(el);
    }
    document.body.appendChild(fragment);
  }
}

class Wagon {
  constructor(number = 1) {
    this.number = number;
    this.size = {width: 10, height: 10};
    this.velocity = {x: 0, y: 0};
    this.prevousVelocity = this.velocity;
    this.element = null;
  }
  getSize() {
    return this.size
  }
  getVelocity() {
    return this.velocity
  }
  getNumber() {
    return this.number
  }
  setVelocity(x = 0, y = 0) {
    this.prevousVelocity = {...this.velocity};
    [
      this.velocity.x,
      this.velocity.y
    ] = [
      x - this.size.width / 2,
      y - this.size.height / 2
    ];
  }
  calculateDegrees() {
    const degrees = Math.atan2(
      this.prevousVelocity.y - this.velocity.y,
      this.prevousVelocity.x - this.velocity.x
    ) * 180 / Math.PI;
    return degrees;
  }
  draw(offsetX = 0, offsetY = 0) {
    const styleAttr = {
      position: {value: 'absolute'},
      width: {value: this.size.width, unit: 'px'},
      height: {value: this.size.height, unit: 'px'},
      left: {value: this.velocity.x + offsetX, unit: 'px'},
      top: {value: this.velocity.y + offsetY, unit: 'px'},
      transform: {value: new CSSRotate(CSS.deg(this.calculateDegrees() - 180))}
    };
    if (! this.element) {
      this.element = document.createElement('div');
      this.element.setAttribute('class', 'wagon');
      this.element.style.position = 'absolute';
      this.element.style = styleAttr;
    }
    for (let [key, value] of Object.entries(styleAttr)) {
      this.element.attributeStyleMap.set(
        key,
        value.unit ? CSS[value.unit](value.value) : value.value
      );
    }
    return this.element;
  }
}

export { Train };
