import string

alphabet=string.ascii_lowercase+' '

def vigenere_encrypt(message,cle):
    lettres=message.split()
    code=[]
    for i in range(0,len(message)):
        m=alphabet.index(message[i])
        c=alphabet.index(cle[i%len(cle)])
        code.append(alphabet[(m+c)%len(alphabet)])
    separateur=""
    return separateur.join(code)


def vigenere_decrypt(code,cle):
    lettres=code.split()
    message=[]
    for i in range(0,len(code)):
        co=alphabet.index(code[i])
        c=alphabet.index(cle[i%len(cle)])
        message.append(alphabet[(co-c)%len(alphabet)])
    separateur=""
    return separateur.join(message)

def test():
    code=vigenere_encrypt("cryptographie","mathweb")
    print(vigenere_decrypt(code,"mathweb"))

#test()