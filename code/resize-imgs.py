'''
Script para redimensionar todas as imagens JPG em um diretório para a largura
especificada, preservando as proporções de altura.

Uso:
python3 resize-imgs.py src dst width
'''

# Checa se os argumentos foram usados corretamente na linha de comando
import sys

if len(sys.argv) < 4:
  print("Usage: python3 resize-imgs.py src dst width")
  sys.exit(1)

# Módulos
import glob
import os
from PIL import Image
import re

# Funcionalidades

def clean_extra_slash(string):
  '''
  Caso o usuário entre o diretório com '/' no final,
  ele remove o caractere em excesso para que a string
  siga o padrão usado pelo restante do programa.
  '''
  if "//" in string: 
    string = string.replace("//","/")
  
  return string

def find_files(src_dir):
  '''
  Usa o argumento src (argv[1]) da linha de comando
  para fazer uma busca de arquivos jpg usando glob.
  Retorna um array de paths.
  '''

  to_glob = f"{src_dir}/*.jpg"
  to_glob = clean_extra_slash(to_glob)
  files = glob.glob(to_glob)

  return files

def extract_fname(src_dir, src_path):
  '''
  Extrai o nome do arquivo de um dos paths
  encontrados por find_files.
  '''
  regexp = f"{src_dir}(.*\.jpg)"
  fname = re.search(regexp, src_path).group(1)
  return fname

def reduce_img(img_path, width, dst_dir, fname):
  '''
  Reduz as dimensões de uma imagem de acordo
  com a largura determinada no parâmetro width
  (sys.argv[3]) da linha de comando
  '''

  # Abre a imagem
  img = Image.open(img_path)

  # Computa a altura com base na proporção
  # que a largura determinada tem da largura original
  width_percent = width / img.size[0]
  height = int(img.size[1] * width_percent)
  size = width, height

  # Faz a operação
  img = img.resize(size, Image.ANTIALIAS)

  # Salva
  outfile = f"{dst_dir}{fname}"
  img.save(outfile)


# Execução
def main():

  src_dir = clean_extra_slash(sys.argv[1])
  dst_dir = clean_extra_slash(sys.argv[2])
  width = int(sys.argv[3])

  if not os.path.exists(dst_dir):
    os.makedirs(dst_dir)

  src_files = find_files(src_dir)

  for img_path in src_files:
    fname = extract_fname(src_dir, img_path)
    reduce_img(img_path, width, dst_dir, fname)


if __name__ == "__main__":
  main()