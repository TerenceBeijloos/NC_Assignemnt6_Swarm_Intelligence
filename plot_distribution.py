import pandas as pd
import matplotlib.pyplot as plt

def plot(generation_data,name):
    plt.figure(figsize=(12, 4))
    plt.subplot(1, 4, 1)
    plt.hist(generation_data['Fitness'], bins=10, edgecolor='black')
    plt.xlabel('Fitness')
    plt.ylabel('Frequency')
    plt.title(f'Fitness Distribution - Generation {name}')
    plt.grid(True)

    plt.subplot(1, 4, 2)
    plt.hist(generation_data['Cohesion'], bins=10, edgecolor='black')
    plt.xlabel('Cohesion')
    plt.ylabel('Frequency')
    plt.title(f'Cohesion Distribution - Generation {name}')
    plt.grid(True)

    plt.subplot(1, 4, 3)
    plt.hist(generation_data['Alignment'], bins=10, edgecolor='black')
    plt.xlabel('Alignment')
    plt.ylabel('Frequency')
    plt.title(f'Alignment Distribution - Generation {name}')
    plt.grid(True)

    plt.subplot(1, 4, 4)
    plt.hist(generation_data['Separation'], bins=10, edgecolor='black')
    plt.xlabel('Separation')
    plt.ylabel('Frequency')
    plt.title(f'Separation Distribution - Generation {name}')
    plt.grid(True)

    plt.tight_layout()
    plt.show()

# Read the data from the file
data = pd.read_csv('6.4.csv')
gen_0 = data[data['Generation'] == 0]
gen_50 = data[data['Generation'] == 50]
gen_99 = data[data['Generation'] == 99]

plot(gen_0,0)
plot(gen_50,50)
plot(gen_99,99)
