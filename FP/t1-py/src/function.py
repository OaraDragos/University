from pickle import EMPTY_LIST


def create_coffe(name:str,country_of_origin:str,price:float):
    coffe={'name':name,'country_of_origin':country_of_origin,'price':price}
    return coffe

def get_coffe_name(coffe):
    return coffe['name']
def get_coffe_price(coffe):
    return coffe['price']
def get_coffe_country(coffe):
    return coffe['country_of_origin']

def set_coffe_country(coffe,country_of_origin):
    coffe['country_of_origin'] = country_of_origin
def set_coffe_name(coffe,name):
    coffe['name'] = name
def set_coffe_price(coffe,price):
    coffe['price'] = price
    ''' if isinstance(coffe_list,list):  '''

def add_coffe(coffe_list,coffe):
    if not(isinstance(get_coffe_name(coffe),str)) or not(isinstance(get_coffe_country(coffe),str)) or not(isinstance(get_coffe_price(coffe),float)):
        raise ValueError('coffe name and country of origin must be strings and price must be float')
    if get_coffe_name(coffe)=='' or get_coffe_country(coffe)=='' or get_coffe_price(coffe) <0:
        raise ValueError('please do not leave blank or price < 0')
    coffe_list.append(coffe)
    return coffe_list

def filter_coffe_by_origin_and_price(coffe_list,country_of_origin,price):
    new_coffe_list=[]
    if country_of_origin == '' :
        raise ValueError('missing coffe origin ')

    if price is None:
        raise ValueError('missing coffe price')

    for coffe in coffe_list:
        if get_coffe_country(coffe)==country_of_origin and get_coffe_price(coffe)<=price:
            new_coffe_list.append(coffe)

    if new_coffe_list == []:
        raise ValueError('no such coffes')

    return new_coffe_list

def delete_all_coffe_with_origin(coffe_list,country_of_origin):
    if not(isinstance(country_of_origin,str)):
        raise ValueError('country_of_origin must be string')
    if country_of_origin is None:
        raise ValueError('country_of_origin must not be empty')
    new_coffe_list = []
    for coffe in coffe_list:
        if coffe['country_of_origin'] != country_of_origin:
            new_coffe_list.append(coffe)
    if new_coffe_list == []:
        print('coffe list does not contain this type of coffe')
    else:
        return new_coffe_list

def sort_coffe_by_country(coffe_list):

    sorted_coffe_list=sorted(coffe_list,key=get_coffe_country,reverse=True)
    return sorted_coffe_list

def initializate_3_coffes(coffe_list):
    coffe_list.append(create_coffe('Arabica','Nigeria',68))
    coffe_list.append(create_coffe('Indian_coffe', 'Indian', 65))
    coffe_list.append(create_coffe('Tunah', 'Brazil', 13))
    return coffe_list

def print_coffe_list(coffe_list):
    for coffe in coffe_list:
        print(f"name: {get_coffe_name(coffe)}, country_of_origin: {get_coffe_country(coffe)}, price: {get_coffe_price(coffe)}")

def add_tester():
    coffe_list=[]

    add_coffe(coffe_list,create_coffe('Arabica','Nigeria',68))
    add_coffe(coffe_list, create_coffe('Indian_coffe', 'Indian', 65))

    assert coffe_list[0]['name'] == 'Arabica'
    assert coffe_list[1]['name'] == 'Indian_coffe'

def sort_coffe_by_origin(coffe_list):
    coffe_list.sort(key=get_coffe_country,reverse=True)
    for i in range(len(coffe_list)):
        if i!=len(coffe_list)-1:
            if coffe_list[i]['country_of_origin'] == coffe_list[i+1]['country_of_origin']:
                if coffe_list[i]['price']>coffe_list[i+1]['price']:
                    coffe_list[i],coffe_list[i+1]=coffe_list[i+1], coffe_list[i]
    return coffe_list