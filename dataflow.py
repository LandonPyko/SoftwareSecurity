import graph  # Import other file

# globals
tainted = {}
flow = False
# ==============================

# We're iterating over all basic blocks


def source(block):

    
    return
def sink(block):
    return

def main():
    blocks = graph.main()

# Iteration thought process (for loops):
#   - Put all of the below in a while loop that goes until unchanged
#   - So at most this loop will run 2(?) times if there are no loops
#   - If there are loops, change some variable to true and finish iterating through everything and go again
#   - Not the most efficient but it would work

    for block in blocks:
        for line in block.get_lines():

            if(source): # Check if value is a source
                # do something
                pass

            if (sink): # Check if value is a sink
                pass

        # ====================================================================================
            # HANDLE INSTRUCTIONS HERE

            # MATH
            if("add" in line) or ("sub" in line) or ("mul" in line) or ("div" in line):
                mathInst(line,block)

            # ICMP

            # LOAD

            # STORE



        # ====================================================================================
        
        # 

        # =================================================
    
        

def mathInst(line, block):  # checks if using tainted value, if so propagate taint
    lhs = line.split()[0]
    for val in block.get_vals():
        if val in line:
            block.addVal(lhs)
    print(line.split()[0])
    return

def compareInst(line,block):
    return

def loadInst(line,block):
    return

def storeInst(line,block):
    return


if __name__ == "__main__":
    main()