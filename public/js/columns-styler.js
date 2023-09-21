export const ColumnsStyler = function () {
  const colors = ["navy", "aqua", "green", "orange", "red", "blue", "yellow", "plum"];
  const animations = ["column-from-top", "column-from-right", "column-from-bottom", "column-from-left"];
  const groupColumns = document.querySelectorAll(".group-column > .group-container");

  /**
   * Method used to receive random element from provided array
   * @param {Object} array The array from which we want to receive element
   * @param {Boolean} remove If we want to remove the received random element from array (to prevent duplicates)
   * @returns random element from input array
   */
  const getRandom = function (array, remove) {
    const randomItem = array[Math.floor(Math.random() * array.length)];
    if (remove) {
      var index = array.indexOf(randomItem);
      if (index !== -1) {
        array.splice(index, 1);
      }
    }
    return randomItem;
  };

  /**
   * Method used to set style for all group columns (position, colors and animation)
   */
  const initStyle = function () {
    groupColumns.forEach((column) => {
      // get color from array and then remove it so no duplicates are selected (in next iterations)
      const selectedColor = getRandom(colors, true);
      column.classList.add("background-" + selectedColor);
      column.querySelector(".group-title").classList.add("background-" + selectedColor);
      // get animation from array (duplicates are allowed in this case)
      column.classList.add(getRandom(animations, false));
    });
  };

  return { initialize: initStyle };
};
