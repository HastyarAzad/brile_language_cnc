import React, { Component, Fragment } from "react";
import "./home.scss";
import axios from "axios";

class Home extends Component {
  state = {
    text: "",
  };

  handleInputChange = (event) => {
    this.setState({ text: event.target.value });
  };

  handleTranslate = async () => {
    const result = await axios.put("http://localhost:3001/", {
      text: this.state.text,
    });
    console.log(result.data);
    this.setState({ text: "" });
  };

  // handleStepper = async () => {
  //   const result = await axios.post("http://localhost:3001/forward");
  //   console.log(result.data);
  // };

  onEnter = (event) => {
    const key = event.code;
    if (key === "Enter") {
      this.handleTranslate();
    }
  };

  render() {
    return (
      <Fragment>
        <div className="body">
          <h1>Braile Language Translator</h1>
          <div className="main">
            <textarea
              onKeyPress={this.onEnter}
              value={this.state.text}
              onChange={this.handleInputChange}
              className="text_area"
            ></textarea>
            <button onClick={this.handleTranslate}>Translate</button>
            {/* <button onClick={this.handleStepper}>Move stepper</button> */}
          </div>
        </div>
      </Fragment>
    );
  }
}

export default Home;
