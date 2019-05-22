import sys
import csv
import json


def convert_csv(infile, outfile):
    with open(infile, "r") as f:
        reader = csv.DictReader(f)
        data = [row for row in reader]
        with open(outfile, "w") as o:
            json.dump(data, o)


if __name__ == "__main__":
    convert_csv(sys.argv[1], sys.argv[2])
