
/* Função que desenha o primeiro canvas, com todas as imagens */
function drawCanvas(opacity, x0, x1, y0, y1, hiRes) {

  function drawAll(datapoints, opacity, sizeMultiplier) {
    /*
    Desenha todos os datapoints no canvas
    com uma opacidade de menor destaque.
    */

    // Seleciona a div
    var container = d3.select(".container");

    // Cria e seleciona um canvas
    var canvas = container.append("canvas")
      .attr('width', dimensions.width)
      .attr('height', dimensions.height)
      .attr('id', 'base-canvas')
      .attr('class', 'canvas-plot');

    // Cria um contexto para executar o desenho
    var ctx = canvas.node().getContext('2d');
    // Define a transparência do canvas
    ctx.globalAlpha = opacity;

    // Calcula o tamanho da imagem para manter a
    // proporcionalidade em relação ao tamanho
    // máximo da tabela
    var imgWidth  = baseImgSize * sizeMultiplier;

    // Para cada datapoins, carrega e adiciona uma imagem
    datapoints.forEach(function(d){

      var img = new Image();

      img.addEventListener('load', function() {

        ctx.drawImage(img, xPositionScale(d.x_pos), yPositionScale(d.y_pos), imgWidth, img.height * (imgWidth / img.width));
      }, false);

      img.src = imgDir + d.img + ".jpg";

    })

  }

  if (!hiRes) {
    console.log("not hiRes");
    var imgDir = "../data/imgs-small/"
  }
  else {
    console.log("hiRes");
    var imgDir = "../data/imgs/"
  }

  /* As dimensões sempre serão 2000 x 2000,
  independentemente de estarmos desenhando
  a nuvem toda ou apenas o zoom em uma área. */
  const dimensions = {
    "width"  : 2000,
    "height" : 2000
  };

  const baseImgSize = dimensions.width / 200;

  /* Os domínios das escals são definidos
  posteriormente, com base nos valores mínimos 
  e máximos dos datapoints, já filtrados pelo 
  bounding box passado (x0, x1, y0, y1) */
  const xPositionScale = d3.scaleLinear();
  const yPositionScale = d3.scaleLinear();

  d3.queue()
    .defer(d3.csv, "../output/tsne-2019-08-16_13-45.csv")
    .await(ready);

  function ready(error, datapoints) {

    console.log("baseImgSize:", baseImgSize);

    /* Calcula a proporção da bounding 
    box em relação ao valor total */
    var bbox_proportion = (x1 - x0) / 1;
    var sizeMultiplier  = 1 / bbox_proportion;
    console.log("bbox_proportion:", bbox_proportion);
    console.log("sizeMultiplier:", sizeMultiplier);


    /* Filtra os datapoins para manter apenas os
    que se encontram dentro da área que queremos destacar */
    datapoints = datapoints.filter(function(d){
      return (d.x_pos >= x0) && (d.x_pos <= x1) &&
             (d.y_pos >= y0) && (d.y_pos <= y1);
    });


    /* Define o domínio com base nos valores mínimo
    e máximo do banco de dados */
    var xDomain = d3.extent(datapoints.map(function(d){ return d.x_pos; }))
    xPositionScale.domain(xDomain)
                  .range([0, dimensions.width - baseImgSize * sizeMultiplier]);


    var yDomain = d3.extent(datapoints.map(function(d){ return d.y_pos; }))
    yPositionScale.domain(yDomain)
                  .range([dimensions.height - baseImgSize * sizeMultiplier, 0]);

    drawAll(datapoints, opacity, sizeMultiplier);

  }

};

/* Funções para executar no console e alterar a imagem */
function addHighlights(highlightIds, x0, x1, y0, y1, opacity, hiRes) {
  /*
  Recebe um array de ids que devem ser destacados e desenha
  eles com opacidade maior sobre o canvas original.
  Desenha elas sobre o canvas original 
  */

  // Padrão de opacidade é 1
  if (!opacity) {
    opacity = 1;
  }

  if (!hiRes) {
    console.log("not hiRes");
    var imgDir = "../data/imgs-small/"
  }
  else {
    console.log("hiRes");
    var imgDir = "../data/imgs/"
  }

  const dimensions = {
    "width"  : 2000,
    "height" : 2000
  };

  const baseImgSize = dimensions.width / 200;

  const xPositionScale = d3.scaleLinear();
  const yPositionScale = d3.scaleLinear();

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

    console.log("baseImgSize:", baseImgSize);

    /* Calcula a proporção da bounding 
    box em relação ao valor total da nuvem */
    var bbox_proportion = (x1 - x0) / 1;
    var sizeMultiplier  = 1 / bbox_proportion;
    console.log("bbox_proportion:", bbox_proportion);
    console.log("sizeMultiplier:", sizeMultiplier);

    // Calcula o tamanho da imagem para manter a
    // proporcionalidade em relação ao tamanho
    // máximo da tabela
    var imgWidth  = baseImgSize * sizeMultiplier;

    /* Filtra os datapoins para manter apenas os
    que se encontram dentro da área que queremos destacar
    E se a imagem se encontrar em um dos highlightIds */
    datapoints = datapoints.filter(function(d){
      return (d.x_pos >= x0) && (d.x_pos <= x1) &&
             (d.y_pos >= y0) && (d.y_pos <= y1) &&
             (highlightIds.includes(d.img));
    });
    console.log(datapoints);


    /* Define o domínio com base nos valores mínimo
    e máximo do banco de dados */
    var xDomain = [x0, x1];
    xPositionScale.domain(xDomain)
                  .range([0, dimensions.width - baseImgSize * sizeMultiplier]);


    var yDomain = [y0, y1];
    yPositionScale.domain(yDomain)
                  .range([dimensions.height - baseImgSize * sizeMultiplier, 0]);

    datapoints.forEach(function(d){

      var img = new Image();

      img.addEventListener('load', function() {
        ctx.drawImage(img, xPositionScale(d.x_pos), yPositionScale(d.y_pos), imgWidth, img.height * (imgWidth / img.width));
      }, false);

      img.src = imgDir + d.img + ".jpg";


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

// Faz o desenho inicial, com a 
// opacidade definida no parâmetro único 
// drawCanvas(.1);
