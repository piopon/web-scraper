export const ColumnsStyler = function () {
  const groupColumns = document.querySelectorAll(".group-column > .group-container");

  /**
   * Method used to set style for all group columns (position, colors and animation)
   */
  const initStyle = function () {
    const colors = ["navy", "aqua", "green", "orange", "red", "blue", "yellow", "plum"];
    const animations = ["column-from-top", "column-from-right", "column-from-bottom", "column-from-left"];
    groupColumns.forEach((column) => {
      // get color from array and then remove it so no duplicates are selected (in next iterations)
      const selectedColor = colors[Math.floor(Math.random() * colors.length)];
      var index = colors.indexOf(selectedColor);
      if (index !== -1) {
        colors.splice(index, 1);
      }
      column.classList.add("background-" + selectedColor);
      column.querySelector(".group-title").classList.add("background-" + selectedColor);
      // get animation from array (duplicates are allowed in this case)
      const selectedAnimation = animations[Math.floor(Math.random() * animations.length)];
      column.classList.add(selectedAnimation);
    });
  };

  return { initialize: initStyle };
};
