window.initMap = function() {
    console.log("Mappa caricata!");
    const map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 45.4642, lng: 9.1900 },
        zoom: 12
    });
};