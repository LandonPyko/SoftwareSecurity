import graph  # Import other file

# globals
tainted = {}
flow = False
# ==============================

# We're iterating over all basic blocks


def source(block):

    if ("@SOURCE()" in block.get_leader()):
        # Add variable to tainted set
        pass
    if (block.get_body() != []):
        for i in range(len(block.get_body())):
            if ("@SOURCE()" in block.get_body()[i]):
                # add variable to tainted set
                pass
    if (block.get_size() != 1 and "@SOURCE()" in block.get_terminator()): 
        # add variable to tainted set
        pass
    return
def sink(block):
    return

def main():
    blocks = graph.main()

    for block in blocks:
        print(block.get_lines())

        # perhaps we should iterate over each line here and pass the line into source and sink
        if(source):
            # do something
            pass

        if (sink):
            pass
    
        
        


if __name__ == "__main__":
    main()