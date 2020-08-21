class MapData {
  constructor(state, code_id, orderState, ind) {
    this.state = state;
    this.code_id = code_id;
    this.orderState = orderState;
    this.ind = ind;
    this.url = "http://localhost:8080";
  }
  getCoordinate() {
    return new Promise((resolve, reject) => {
      try {
        fetch(
          this.state === "province"
            ? `${this.url}/coordinate/${this.state}`
            : `${this.url}/coordinate/${this.state}/${this.code_id}`
        )
          .then((res) => res.json())
          .then((res) => {
            resolve(res);
          });
      } catch (error) {
        reject(error);
      }
    });
  }
  getProblem() {
    return new Promise((resolve, reject) => {
      try {
        fetch(
          this.state === "province"
            ? `${this.url}/poor/problem/${this.state}`
            : `${this.url}/poor/problem/${this.state}/${this.code_id}`
        )
          .then((res) => res.json())
          .then((res) => {
            resolve(res[0]);
          });
      } catch (error) {
        reject(error);
      }
    });
  }
  getOrder() {
    return new Promise((resolve, reject) => {
      let url;
      try {
        if (this.state === "province") {
          url = `${this.url}/poor/order/${this.state}?state=${this.orderState}&ind=${this.ind}`;
        } else if (
          this.state === "amphur" ||
          this.state === "tambol" ||
          this.state === "village"
        ) {
          url = `${this.url}/poor/order/${this.state}/${this.code_id}?state=${this.orderState}&ind=${this.ind}`;
        }
        fetch(url)
          .then((res) => res.json())
          .then((res) => {
            resolve(res);
          });
      } catch (error) {
        reject(error);
      }
    });
  }
  getPoor() {
    return new Promise((resolve, reject) => {
      try {
        fetch(
          this.state === "province"
            ? `${this.url}/poor/${this.state}`
            : `${this.url}/poor/${this.state}/${this.code_id}`
        )
          .then((res) => res.json())
          .then((res) => {
            resolve(res);
          });
      } catch (error) {
        reject(error);
      }
    });
  }
  getMax() {
    return new Promise((resolve, reject) => {
      try {
        let url;
        if (this.state === "province") {
          url = `${this.url}/poor/max/${this.state}?ind=${this.ind}`;
        } else {
          url = `${this.url}/poor/max/${this.state}/${this.code_id}?ind=${this.ind}`;
        }
        fetch(url)
          .then((res) => res.json())
          .then((res) => {
            resolve(res[0]);
          });
      } catch (error) {
        reject(error);
      }
    });
  }
  getCentroid() {
    return new Promise((resolve, reject) => {
      try {
        fetch(`${this.url}/centroid/${this.state}/${this.code_id}`)
          .then((res) => res.json())
          .then((res) => {
            resolve(res[0]);
          });
      } catch (error) {
        reject(error);
      }
    });
  }
  getMarker() {
    return new Promise((resolve, reject) => {
      try {
        fetch(
          this.code_id === null
            ? `${this.url}/marker/${this.state}`
            : `${this.url}/marker/${this.state}/${this.code_id}`
        )
          .then((res) => res.json())
          .then((res) => {
            resolve(res);
          });
      } catch (error) {
        reject(error);
      }
    });
  }
}
