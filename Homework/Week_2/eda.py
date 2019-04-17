# from pandas import DataFrame
import pandas
import matplotlib.pyplot as plt
import json

INPUT_CSV = "input.csv"
JSON_FILE = "analysis.json"

def import_data():
    # with open("input.csv", "r") as f:
    df = pandas.read_csv(INPUT_CSV)
    df.set_index("Country", inplace=True)
    unused = ("Population", "Area (sq. mi.)", "Coastline (coast/area ratio)",
    "Net migration", "Literacy (%)", "Phones (per 1000)", "Arable (%)",
    "Crops (%)", "Other (%)", "Climate", "Birthrate", "Deathrate",
    "Agriculture", "Industry", "Service")
    for column in unused:
        df.pop(column)

    # Strip values of whitespace and string characters
    df["Region"] = df["Region"].str.strip()
    df["GDP ($ per capita) dollars"] = \
    df["GDP ($ per capita) dollars"].str.strip(" dollars")
    df["GDP ($ per capita) dollars"] = \
    df["GDP ($ per capita) dollars"].str.strip()

    # Drop rows with unknown values
    df.dropna(axis=0, inplace=True)
    df.drop(df[df["GDP ($ per capita) dollars"] == "unknown"].index,
    inplace=True)
    df.drop(df[df["Pop. Density (per sq. mi.)"] == "unknown"].index,
    inplace=True)
    df.drop(df[df["Infant mortality (per 1000 births)"] == "unknown"].index,
    inplace=True)

    # Convert to numeric
    df["GDP ($ per capita) dollars"] \
    = pandas.to_numeric(df["GDP ($ per capita) dollars"])
    df["Pop. Density (per sq. mi.)"] \
    = pandas.to_numeric(df["Pop. Density (per sq. mi.)"].str.replace(",", "."))
    df["Infant mortality (per 1000 births)"] = \
    pandas.to_numeric(df["Infant mortality (per 1000 births)"].str.replace(",", "."))

    # Remove outliers on relevant columns
    mean = df["GDP ($ per capita) dollars"].mean()
    df = df[df["GDP ($ per capita) dollars"]-mean
    <= (3*df["GDP ($ per capita) dollars"].std())]
    mean = df["Infant mortality (per 1000 births)"].mean()
    df = df[df["Infant mortality (per 1000 births)"]-mean
    <= (3*df["Infant mortality (per 1000 births)"].std())]
    return df


def analyze_gdp(df):
    # Compute and print descriptive statistics for GDP
    mean = df["GDP ($ per capita) dollars"].mean()
    median = df["GDP ($ per capita) dollars"].median()
    mode = df["GDP ($ per capita) dollars"].mode().values[0]
    std = df["GDP ($ per capita) dollars"].std()
    print("Descriptive statistics for GDP")
    print(f"Mean: {mean}")
    print(f"Median: {median}")
    print(f"Mode: {mode}")
    print(f"Std. dev: {std}")
    df.hist(column="GDP ($ per capita) dollars")
    plt.show()


def analyze_mortality(df):
    # Compute and print five numver summary for infant mortality
    min = df["Infant mortality (per 1000 births)"].min()
    fq = df["Infant mortality (per 1000 births)"].quantile(.25)
    median = df["Infant mortality (per 1000 births)"].median()
    tq = df["Infant mortality (per 1000 births)"].quantile(0.75)
    max = df["Infant mortality (per 1000 births)"].max()
    print("Five number summary for infant mortality (per 1000 births)")
    print(f"Minumum: {min}")
    print(f"First quartile: {fq}")
    print(f"Median: {median}")
    print(f"Third quartile: {tq}")
    print(f"Maximum: {max}")

    # Show boxplot of infant mortality
    plt.boxplot(df["Infant mortality (per 1000 births)"])
    plt.title("Infant mortality per 1000 births")
    plt.show()


def write_json(df):
    with open(JSON_FILE, "w") as f:
        json.dump(df.T.to_dict(orient="dict"), f)


if __name__ == "__main__":
    df = import_data()
    analyze_gdp(df)
    analyze_mortality(df)
    write_json(df)
