var Expand = (function () {
  var tileLink = document.querySelectorAll(".strips__strip > .strip__content");
  var stripClose = document.querySelector(".strip__close");
  var expanded = false;

  var open = function (elContent) {
    if (!expanded) {
      elContent.parentNode.classList.add("strips__strip--expanded");
      elContent.querySelector(".strip__inner-text").style.transition = "all .5s .3s cubic-bezier(0.23, 1, 0.32, 1)";
      stripClose.classList.add("strip__close--show");
      stripClose.style.transition = "all .6s 1s cubic-bezier(0.23, 1, 0.32, 1)";
      expanded = true;
    }
  };

  var close = function (elContent) {
    if (expanded) {
      var elExpanded = elContent.parentNode.querySelector(".strips__strip--expanded");
      elContent.parentNode
        .querySelector(".strips__strip--expanded")
        .querySelector(".strip__inner-text").style.transition = "all 0.15s 0 cubic-bezier(0.23, 1, 0.32, 1)";
      elExpanded.classList.remove("strips__strip--expanded");
      stripClose.classList.remove("strip__close--show");
      stripClose.style.transition = "all 0.2s 0s cubic-bezier(0.23, 1, 0.32, 1)";
      expanded = false;
    }
  };

  var bindActions = function () {
    [].forEach.call(tileLink, function (tlnk) {
      tlnk.addEventListener("click", function () {
        open(this);
      });
    });
    stripClose.addEventListener("click", function () {
      close(this);
    });
  };

  var init = function () {
    bindActions();
  };

  return {
    init: init,
  };
})().init();
