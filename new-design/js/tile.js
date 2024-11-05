class Tile {
    text = ''
    textColor = ''
    textAlignment = ''
    Icon = ''
    iconColor = ''
    iconAlignment = ''
    bgColor = ''
    bgImage = ''
    service = null
    toPageId = null
}

const tileObj = {
    text: "Tile",
    textColor: "#000000",
    textAlignment: "left",
    icon: "Tile",
    iconColor: "#000000",
    iconAlignment: "left",
    bgColor: "#ffffff",
    bgImage: "",
}

var tile = new Tile()
tile.text = 'Tile 1'

var tile2 = new Tile()
tile2.text = 'Tile 2'

console.log(tile)
console.log(tile2)