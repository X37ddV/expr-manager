import "./app.scss";
import View from "./scripts/view";
import Main from "./views/main/main";
import $ from "jquery";

class App extends View {
    private main: Main;
    protected preinitialize () {
        this.className = "app-view";
        this.el = $("#app");
    }
    protected initialize () {
        this.main = new Main();
        this.main.$el.appendTo(this.$el);
        this.main.refresh(true);
    }
}

$(document).ready(() => {
    (<any> window).App = new App();
});
