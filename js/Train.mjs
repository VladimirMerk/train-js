class Train {
  constructor(wagonCount = 1) {
    this.wagons = this.buildWagons(wagonCount);
    // this.path = [[50,50], [250,50]]
    this.path = null; // SVGPathElement
    this.pathLength = 0;
    this.speed = 5
    this.direction = 1
  }
  buildWagons(wagonCount = 1) {
    const wagons = new Array(wagonCount).fill(null)
    return wagons.map(() => new Wagon())
  }

  /**
   * @param  {SVGPathElement} path
   */
  setRailway(path) {
    this.path = path;
    this.pathLength = path.getTotalLength();
    this.setWagonsOnRailway();
  }
  setWagonsOnRailway() {
    const trainWidth = this.getWidthTrain();
    let buildTrainWidth = 0;
    for (const wagon of this.wagons) {
      const wagonSize = wagon.getSize();
      const position = wagon.setPosition((trainWidth - buildTrainWidth) - wagonSize.width / 2);
      const pointOnPath = this.path.getPointAtLength(position);
      buildTrainWidth += wagonSize.width;
      wagon.setVelocity(pointOnPath.x, pointOnPath.y);
    }
  }

  getWidthTrain() {
    return this.wagons.reduce((total, wagon) => {
      return total + wagon.getSize().width
    }, 0);
  }
  run() {
    setInterval(() => {
      for (const wagon of this.wagons) {
        let position = wagon.getPosition();
        position += (this.speed * this.direction);
        wagon.setPosition(position);
        const pointOnPath = this.path.getPointAtLength(position);
        wagon.setVelocity(pointOnPath.x, pointOnPath.y);
      }
      if (
        this.wagons[0].getPosition() + this.wagons[0].getSize().width >= this.pathLength ||
        this.wagons[this.wagons.length - 1].getPosition() <= 0
      ) {
        this.direction = -this.direction;
      }
      this.draw();
    }, 50)
  }
  draw() {
    const fragment = document.createDocumentFragment();
    for (const wagon of this.wagons) {
      const el = wagon.draw();
      fragment.appendChild(el);
    }
    document.body.appendChild(fragment);
  }
}

class Wagon {
  constructor() {
    this.size = {width: 10, height: 10};
    this.position = 0;
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
  setPosition(position = 0) {
    return this.position = position;
  }
  getPosition() {
    return this.position;
  }

  calculateDegrees() {
    // Rewrite
    return Math.atan2(this.velocity.x, this.velocity.y) * 180 / Math.PI;
  }
  draw() {
    const styleAttr = {
      position: {value: 'absolute'},
      width: {value: this.size.width, unit: 'px'},
      height: {value: this.size.height, unit: 'px'},
      left: {value: this.velocity.x, unit: 'px'},
      top: {value: this.velocity.y, unit: 'px'},
      transform: {value: new CSSRotate(CSS.deg(this.calculateDegrees()))}
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
