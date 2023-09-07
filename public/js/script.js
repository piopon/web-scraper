var Expand = (function () {
  var tileLink = document.querySelectorAll(".group-column > .group-container");
  var stripClose = document.querySelectorAll(".group-container > .group-column-close");
  var expanded = false;

  var open = function (elContent) {
    if (!expanded) {
      elContent.parentNode.classList.add("group-column-expanded");
      elContent.querySelector(".group-content").style.transition = "all .5s .3s cubic-bezier(0.23, 1, 0.32, 1)";
      const closeBtn = elContent.querySelector(".group-column-close")
      closeBtn.classList.add("group-column-close-show");
      closeBtn.style.transition = "all .6s 1s cubic-bezier(0.23, 1, 0.32, 1)";
      expanded = true;
    }
  };

  var close = function (elContent) {
    if (expanded) {
      var elExpanded = elContent.parentNode.parentNode.parentNode.querySelector(".group-column-expanded");
      elExpanded.querySelector(".group-content").style.transition = "all 0.15s 0 cubic-bezier(0.23, 1, 0.32, 1)";
      elExpanded.classList.remove("group-column-expanded");
      elContent.classList.remove("group-column-close-show");
      elContent.style.transition = "all 0.2s 0s cubic-bezier(0.23, 1, 0.32, 1)";
      expanded = false;
    }
  };

  var bindActions = function () {
    [].forEach.call(tileLink, function (tlnk) {
      tlnk.addEventListener("click", function (event) {
        open(this);
        event.stopPropagation();
      });
    });
    [].forEach.call(stripClose, function (colClose) {
      colClose.addEventListener("click", function (event) {
        close(this);
        event.stopPropagation();
      });
    });
  };

  var init = function () {
    bindActions();
  };

  return {
    init: init,
  };
})().init();
