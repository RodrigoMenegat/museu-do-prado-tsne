#### CHECAGEM DE USO CORRETO NA LINHA DE COMANDO
import sys
if len(sys.argv) < 4 or any( [ item for item in sys.argv[1:] if not item.isdigit() ]):
    print("Usage: python compute-tsne.py width height max_dim")
    exit(1)

#### PARÂMETROS GLOBAIS

# Importação de pacotes
import csv
import datetime as dt
import glob
import matplotlib.pyplot as plt
import json
from matplotlib.pyplot import imshow
import numpy as np
import keras
from keras.preprocessing import image
from keras.applications.imagenet_utils import decode_predictions, preprocess_input
from keras.models import Model
from PIL import Image
import re
import os
from sklearn.decomposition import PCA
from sklearn.manifold import TSNE
import tensorflow as tf

#### CONFIGURAÇÕES
tf.logging.set_verbosity(tf.logging.FATAL) # Nível de verbosidade do tensorflow

#########################
### VARIÁVEIS GLOBAIS ###
#########################

# Define o modelo
MODEL = keras.applications.VGG16(weights='imagenet', include_top=True)

# Extração de features usando o modelo acima
FEAT_EXTRACTOR = Model(inputs=MODEL.input, outputs=MODEL.get_layer("fc2").output)

# Path para o diretório com as imagens do Museu do Prado
IMG_DIR = "../data/imgs/"

# Horário de execução para gerar timestamp
NOW = str(dt.datetime.now())[:16].replace(":", "-").replace(" ","_")

###############
### FUNÇÕES ###
###############

def get_feature_list(img_paths):
    '''
    Recebe uma lista de caminhos para imagens .jpg
    e extrai features delas usando o feature extractor
    do modelo (que, aqui, é uma variável global).
    Retorna uma lista de features.
    '''
    
    # Funções auxiliares:
    def load_image(path):
        '''
        Lê uma imagem usando keras.preprossecing.image
        e a transforma em um array X. Posteriormente, usa
        o Numpy para expandir as dimensões deste e, novamente,
        pré-processa usando Keras.
        '''
        img = image.load_img(path, target_size=MODEL.input_shape[1:3])
        img_arr = image.img_to_array(img)
        img_arr = np.expand_dims(img_arr, axis=0)
        img_arr = preprocess_input(img_arr)
        return img, img_arr
    
    # Execução de get_feature_list(img_paths):
    features = [ ]
    path_count = len(img_paths)
    for index, item in enumerate(img_paths):
        print(f"Extracting feature {index + 1} of {path_count}")
        img, img_arr = load_image(item);
        feat = FEAT_EXTRACTOR.predict(img_arr)[0]
        features.append(feat)
        
    features = np.array(features)

    return features

def pca_reduction(features, n_components = 300):
    '''
    Usa um modelo PCA para reduzir os componentes
    do array de features para o valor especificado
    no parâmetro n_components (o default é 300 ou 
    o número de imagens). Retorna tanto a matriz 
    original, na variável pca, quanto as features 
    transformadas seguindo o modelo, na variável 
    pca_features.
    '''
    
    feature_count = len(features)
    if n_components > feature_count:
        n_components = feature_count
    
    pca = PCA(n_components = n_components)
    pca.fit(features)
    pca_features = pca.transform(features)
    
    return pca, pca_features

def tsne_reduction(pca_features, n_components=2, learning_rate=150, perplexity=30, angle=0.2, verbose=0):
    '''
    Pega as features, já com dimensionalidade
    reduzida, e computa posições x e y
    para cada uma delas segundo o modelo de redução
    dimensional t-SNE.
    '''
    
    feat_arr = np.array(pca_features)
    
    tsne = TSNE(n_components = n_components,
                learning_rate = learning_rate,
                perplexity = perplexity,
                angle = angle,
                verbose = verbose)
    
    tsne_matrix = tsne.fit_transform(feat_arr)
    
    return tsne_matrix

def normalize_tsne(tsne_matrix):
    '''
    Recebe as posições computadas pelo
    t-SNE as normaliza em valores entre
    0 e 1. Essas coordendas serão
    posteriormente plotadas via matplotlib.
    
    TO DO: tornar o código legível, porque tá horrível .__.
    '''
    
    x_coords, y_coords = tsne_matrix[:,0], tsne_matrix[:,1]
    x_coords = (x_coords-np.min(x_coords)) / (np.max(x_coords) - np.min(x_coords))
    y_coords = (y_coords-np.min(y_coords)) / (np.max(y_coords) - np.min(y_coords))
    
    return x_coords, y_coords

def save_tsne(img_paths, x_coords, y_coords, width, height, max_dim=100):
    '''
    Cria uma nova imagem RGB com as coordendas computadas
    pelo t-SNE.
    
    Parâmetros:
    img_paths: o caminho para as imagens cujas features foram enviadas para o t-SNE
    x_coords: coordenadas x computadas pelo t-SNE
    y_coords: coordenadas y computadas pelo t-SNE
    width: largura da imagem
    height: altura da imagem
    max_dim: tamanho máximo de cada uma das pinturas na imagem
    
    TO DO: traduzir esse negócio grego, que só um maluco é capaz de ler
    '''
    
    # Cria um zip com a imagem e as coordenadas X e Y
    zip_obj = zip(img_paths, x_coords, y_coords)
    
    # Prepara um array com os valores para serem salvos em csv, 
    # já contendo o cabeçalho do futuro arquivo
    csv_data = [ ["img", "x_pos", "y_pos"], ]

    # Cria também um objeto JSON
    json_data =[ ]
    
    # Compõe e salva uma imagem PNG com o t-SNE calculado
    full_image = Image.new('RGBA', (width, height))
    for img, x_pos, y_pos in zip_obj:
        
        # Extrai o número identificador da imagem
        img_id = re.search(f"{IMG_DIR}(.*)\.jpg", img).group(1)

        # Salva dados para colocar no CSV depois
        current_row = [img_id, x_pos, y_pos]
        csv_data.append(current_row)

        # Salva dados para colocar no JSON
        inner_obj = { "id" : img_id, "point": [ float(x_pos), float(y_pos) ] }
        json_data.append(inner_obj)

        # Constrói a imagem iteração por iteração
        tile = Image.open(img)
        rs = max(1, tile.width/max_dim, tile.height/max_dim)
        tile = tile.resize((int(tile.width/rs), int(tile.height/rs)), Image.ANTIALIAS)
        full_image.paste(tile, (int((width-max_dim)*x_pos), int((height-max_dim)*y_pos)), mask=tile.convert('RGBA'))

    plt.figure(figsize = (16,12))
    full_image.save(f"../output/tsne-{NOW}.png")
    
    # Para cada item no objeto zip, adiciona as informações equivalentes
    with open(f"../output/tsne-{NOW}.csv", "w+") as out:
        csv_writer = csv.writer(out, delimiter=',', quotechar='"', quoting=csv.QUOTE_NONNUMERIC)
        csv_writer.writerows(csv_data)

    # Salva o objeto JSON
    with open (f"../output/tsne-{NOW}.json", "w+") as out:
        json.dump(json_data, out)


################
### EXECUÇÃO ###
################

def main():

    print("Globbing paths... ", end='')
    img_paths = glob.glob(f"{IMG_DIR}*.jpg")
    print("Done!")
    
    print("Extracting features... ", end='')
    features = get_feature_list(img_paths)
    print("Done!")
    
    print("Applying PCA...", end='')
    pca, pca_features = pca_reduction(features)
    print("Done!")
    
    print("Applying t-SNE...", end='')
    tsne_matrix = tsne_reduction(features)
    print("Done!")
    
    print("Normalizing coordinates...", end='')
    x_coords, y_coords = normalize_tsne(tsne_matrix)
    print("Done!")
    
    print("Saving results...", end='')
    save_tsne(img_paths, x_coords, y_coords, int(sys.argv[1]), int(sys.argv[2]), int(sys.argv[3])) 
    print("Done!")

if __name__ == "__main__":
    main()

