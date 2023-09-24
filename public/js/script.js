import { ObserversController } from "./observers-controller.js";
import { GroupsController } from "./groups-controller.js";
import { GroupsStyler } from "./groups-styler.js";

const observersController = ObserversController();
const groupsController = GroupsController();
const groupsStyler = GroupsStyler();

observersController.initialize();
groupsController.initialize();
groupsStyler.initialize();


const cards = document.querySelectorAll('.card');

cards.forEach((card) => {
  card.addEventListener('click', () => {
    if (!card.hasAttribute('active')) {
      updateActiveCard(card);
    }
  });
});

function updateActiveCard(activeCard) {
  cards.forEach((card) => {
    if (card === activeCard) {
      card.setAttribute('active', '');
    } else {
      card.removeAttribute('active');
    }
  })
}


window.addObserver = observersController.add;
window.updateObserver = observersController.update;
