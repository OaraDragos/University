#pragma once

template <typename T>
class DynamicVector {
private:
	T* elems;
	int size, capacity;
	
	void resize();

public:
	DynamicVector(int capacity = 10);
	~DynamicVector();
	DynamicVector& operator= (const DynamicVector& da);
	void add(T new_elem);
	void remove(int index);
	int getSize() const;
	DynamicVector(const DynamicVector& da);
	T* getElems() const {
        return this->elems;
    }

public:
	class iterator {
	private:
		T* ptr;

	public:
		iterator(T* ptr);
		T& operator*() {

			return *(this->ptr);
		}

		T* operator->() {
			return this->ptr;
		}

		iterator& operator++() {
			++(this->ptr);
			return *this;
		}

		iterator operator++(int) {
			iterator tmp{ ptr };
			++ptr;
			return tmp;
		}

		bool operator!=(const iterator& other) {
			return other.ptr != this->ptr;
		}

	};

	iterator begin() {
		return iterator{this->elems};
	}

	iterator end() {
		return iterator{this->elems + this->size};
	}

};

template<typename T>
inline DynamicVector<T>::DynamicVector(int capacity): 
	capacity{ capacity }, size{ 0 }
{
	//this->capacity = capacity;
	//this->size = 0;
	this->elems = new T[this->capacity];
}

template<typename T>
inline DynamicVector<T>::~DynamicVector()
{
	delete[] this->elems;
}

template<typename T>
inline DynamicVector<T>& DynamicVector<T>::operator=(const DynamicVector<T>& da)
{
	// TODO: insert return statement here
	delete[] this->elems;
	this->size = da.size;
	this->capacity = da.capacity;
	this->elems = new T[this->capacity];

	for (int i = 0; i < this->size; i++)
		this->elems[i] = da.elems[i];

	return *this;
}

template<typename T>
void inline DynamicVector<T>::add(T new_elem)
{
	if (this->size == this->capacity)
		this->resize();

	this->elems[this->size++] = new_elem;
}

template<typename T>
inline void DynamicVector<T>::remove(int index)
{
	if (index < 0 || index >= this->size)
		return;
	for (int i = index; i < this->size - 1; i++)
		this->elems[i] = this->elems[i + 1];
	this->size--;
}

template<typename T>
void inline DynamicVector<T>::resize()
{
	this->capacity *= 2;

	T* new_array = new T[this->capacity];

	for (int i = 0; i < this->size; i++)
	{
		new_array[i] = this->elems[i];
	}
	
	delete[] this->elems;
	this->elems = new_array;
}

template<typename T>
int inline DynamicVector<T>::getSize() const
{
	return this->size;
}

template<typename T>
inline DynamicVector<T>::DynamicVector(const DynamicVector& da)
{   
	this->size = da.size;
	this->capacity = da.capacity;
	this->elems = new T[this->capacity];
	for (int i = 0; i < this->size; i++)
		this->elems[i] = da.elems[i];
}

template<typename T>
inline DynamicVector<T>::iterator::iterator(T* ptr)
{
	this->ptr = ptr;
}
