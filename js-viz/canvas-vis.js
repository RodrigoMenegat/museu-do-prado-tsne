
/* Função que desenha o primeiro canvas, com todas as imagens */
function drawCanvas(opacity) {

  function drawAll(datapoints, opacity) {
    /*
    Desenha todos os datapoints no canvas
    com uma opacidade de menor destaque.
    */

    // Seleciona a div
    var container = d3.select(".container");

    var canvas = container.append("canvas")
      .attr('width', dimensions.width)
      .attr('height', dimensions.height)
      .attr('id', 'base-canvas')
      .attr('class', 'canvas-plot');

    var ctx = canvas.node().getContext('2d');
    // Define a transparência do canvas
    ctx.globalAlpha = opacity;

    datapoints.forEach(function(d){

      var img = new Image();

      img.addEventListener('load', function() {

        ctx.drawImage(img, xPositionScale(d.x_pos), yPositionScale(d.y_pos), 10, 10);
      }, false);

      img.src = imgDir + d.img + ".jpg";
      img.alt = 'insira alt aqui';

    })

  }

  const dimensions = {
    "width"  : 2000,
    "height" : 2000
  };

  const imgDir = "../data/imgs-small/"

  const xPositionScale = d3.scaleLinear()
    .domain([0, 1])
    .range([0, dimensions.width - 10]);

  const yPositionScale = d3.scaleLinear()
    .domain([0, 1])
    .range([dimensions.height - 10, 0]);

  d3.queue()
    .defer(d3.csv, "../output/tsne-2019-08-16_13-45.csv")
    .await(ready);

  function ready(error, datapoints) {

    drawAll(datapoints, opacity);

  }

};

/* Funções para executar no console e alterar a imagem */
function addHighlights(highlight_ids, opacity) {
  /*
  Recebe um array de ids de imagens e desenha
  elas sobre o canvas original com opacidade de 1.
  */

  const imgDir = "../data/imgs-small/"

  const dimensions = {
    "width"  : 2000,
    "height" : 2000
  };

  const xPositionScale = d3.scaleLinear()
    .domain([0, 1])
    .range([0, dimensions.width - 10]);

  const yPositionScale = d3.scaleLinear()
    .domain([0, 1])
    .range([dimensions.height - 10, 0]);

  var canvas = d3.select(".canvas-plot");
  var ctx = canvas.node().getContext('2d');
  // Define a transparência do canvas
  ctx.globalAlpha = opacity;


  /*
  TO DO: é ineficiente ao extremo carregar
  todo o CSV de uma vez. Poderiamos criar
  CSVs ou JSONs menores, contendo todos os 
  highlights que desejamos. Assim, só precisaríamos 
  carrega-los uma vez.
  */

  d3.queue()
    .defer(d3.csv, "../output/tsne-2019-08-16_13-45.csv")
    .await(ready);

  function ready(error, datapoints) {

    datapoints = datapoints.filter(function(d){
      console.log(d.img);
      return highlight_ids.includes(d.img)
    })
    console.log(datapoints);

    datapoints.forEach(function(d){

      var img = new Image();

      img.addEventListener('load', function() {
        ctx.drawImage(img, xPositionScale(d.x_pos), yPositionScale(d.y_pos), 10, 10);
      }, false);

      img.src = imgDir + d.img + ".jpg";
      img.alt = 'insira alt aqui';

    })

  }

}

function cleanCanvas() {
  d3.select(".canvas-plot")
    .remove();
}

////////////////////////
/// EXECUÇÃO INICIAL ///
////////////////////////

/* Faz o desenho inicial, com a 
opacidade definida no parâmetro único */
drawCanvas(.1);
