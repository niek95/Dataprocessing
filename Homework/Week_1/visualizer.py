#!/usr/bin/env python
# Name:
# Student number:
"""
This script visualizes data obtained from a .csv file
"""

import csv
import matplotlib.pyplot as plt
import statistics

# Global constants for the input file, first and last year
INPUT_CSV = "movies.csv"
START_YEAR = 2008
END_YEAR = 2018

# Global dictionary for the data
data_dict = {str(key): [] for key in range(START_YEAR, END_YEAR)}

if __name__ == "__main__":
    # Read csv file
    with open(INPUT_CSV, "r") as f:
        movies = csv.DictReader(f)
        # Add movies to global data dictionary, sorted per year
        for movie in movies:
            data_dict[movie["Year"]].append(float(movie["Rating"]))

    # Instantiate lists for plot axes
    x = []
    y = []

    # Add years and averages
    for key, value in data_dict.items():
        x.append(key)
        y.append(statistics.mean(value))

    # Plot graph
    plt.plot(x, y, marker="o")
    plt.show()
