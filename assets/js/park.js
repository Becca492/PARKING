function filtrerEtage(valeur) {
  const zones = document.querySelectorAll(".zone");
  const lanes = document.querySelectorAll(".lane");

  lanes.forEach((lane) => {
    lane.style.display = "none";
  });

  zones.forEach((zone) => {
    if (valeur === "tous") {
      zone.style.display = "flex";

      zone.querySelectorAll(".lane").forEach((lane) => {
        lane.style.display = "flex";
      });
    } else if (zone.dataset.etage === valeur) {
      zone.style.display = "flex";
      zone.querySelectorAll(".lane").forEach((lane) => {
        lane.style.display = "none";
      });
    } else {
      zone.style.display = "none";
    }
  });
}
function filtrerEmplacement(valeur) {
  const stalls = document.querySelectorAll(".stall");
  stalls.forEach((stall) => {
    stall.style.opacity = "1";
    stall.style.outline = "none";
  });

  if (valeur === "tous") return;

  stalls.forEach((stall) => {
    const estLibre = stall.classList.contains("emp");
    const estOccupe =
      !stall.classList.contains("emp") && !stall.classList.contains("reserve");
    const estReserve = stall.classList.contains("reserve");

    let correspond = false;
    if (valeur === "libre" && estLibre) correspond = true;
    if (valeur === "occupe" && estOccupe) correspond = true;
    if (valeur === "reserve" && estReserve) correspond = true;

    if (!correspond) {
      stall.style.opacity = "0.2";
    } else {
      stall.style.outline = "2px solid #8dc63f";
    }
  });
}
