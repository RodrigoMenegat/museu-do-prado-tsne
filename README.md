# Analisando o acervo do Museu do Prado usando Keras e t-SNE.

Esse é o código fonte por trás da matéria [Uma inteligência artificial vai te guiar pelo Museu do Prado; nossa repórter, pela cena cultural de Madri](https://www.estadao.com.br/infograficos/viagem,vai-a-espanha-conheca-antes-o-museu-do-prado-com-a-ajuda-de-um-algoritmo,1025741).

## Metodologia, em termos leigos

Essa matéria foi produzida usando duas técnicas de inteligência artificial.

De início, uma rede neural capaz de descrever o conteúdo de uma imagem foi usada para extrair as ‘features’ de cada uma das 6367 obras. Em uma linguagem mais clara, isso significa que o computador extraiu uma descrição matemática das pinturas.

Esses valores numéricos poderiam ser usados pelo programa para, por exemplo, detectar que La Canal de Mancorbo en los Picos de Europa, de Carlos de Haes, mostra uma paisagem montanhosa.

Esse último passo, a previsão, não foi realizado na reportagem. Foram usados apenas os valores numéricos – e é aí que entra a segunda técnica de inteligência artificial.

Usando um algoritmo chamado t-SNE, comparamos a semelhança entre a descrição numérica de cada obra. Analisando esses valores, o computador calculou a posição que cada imagem deveria ocupar em um plano, de modo que imagens com características semelhantes ficassem próximas umas das outras.

## Conteúdo do repositório

#### Diretório `code`
Contém dois script `.py` e dois Jupyter Notebooks.

Os arquivos `.py` servem para aplicar o modelo e gerar os dados necessários para a visualização.

`compute-tsne.py` acessa as imagens no diretório `data/imgs/` e gera um arquivo CSV, um JSON e uma imagem em PNG com o resultado da operação.

`rezise-imgs.py` foi usado para criar imagens em tamanho menor dentro do diretório `data/imgs-small/` – algo útil para diminuir o tempo de processamento na hora de renderizar as visualizações, mas opcional.

Nos arquivos `.ipynb` estão as "perguntas" que fizemos às bases de dados para encontrar o eixo narrativo da reportagem, especialmente em `explorar-resultados.ipynb`. `gerar-ids-para-canvas.ipynb` simplesmente mostra os identificadores das imagens que aparecem em destaque em cada etapa do material. Esses dois arquivos estão bagunçados e mal documentados, mas não são essenciais para reproduzir a análise.

#### Diretório `data`

No subdiretório `imgs`, temos todas as imagens analisadas em alta resolução.

Em `imgs-small` estão as mesmas imagens, mas em tamanho reduzido.

O diretório `metadata` contém informações sobre cada uma das imagens em formato TSV.

#### Diretório `output`

Os scripts contidos no diretório `code` salvam seus resultados nessa pasta.

De início, ela contém um arquivo CSV e um arquivo JSON com as coordenadas x e y exibidas na matéria.

#### Diretório `js-viz`

Contém um arquivo JavaScript e um arquivo CSS que contém as funções e estilos necessários para renderizar a visualização de dados, que foi feita em Canvas.