# Clusterização de imagens usando keras e t-SNE

Esse script agrupa imagens semelhantes usando uma rede neural VGG-18, dipsonível no pacote Keras, e o algoritmo t-SNE, disponível no pacote TensorFlow.

O script pode ser usado via linha de comando:

```
python compute-tsne.py width height max_dim
```

Depois de executado, dois arquivos são salvos no diretório `output`: um arquivo CSV com as coordenadas x e y computados pelo t-SNE e uma imagem PNG com todas as imagens em suas respectivas posições.
