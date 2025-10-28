import graph  # Import other file
import sys
# globals
flow = False
# ==============================

# We're iterating over all basic blocks


def source(line,block):
    if ("@SOURCE" in line):
        lhs = line.split()[0]
        block.addVal(lhs)
    
def sink(line,block):
    global flow
    if("@SINK" in line):
        for val in block.get_vals():
            if val in line:
                flow = True
def main():
    global flow
    blocks = graph.main()

# Iteration thought process (for loops/backedges):
#   - Put all of the below in a while loop that goes until unchanged
#   - So at most this loop will run 2(?) times if there are no loops
#   - If there are loops, change some variable to true and finish iterating through everything and go again
#   - Not the most efficient but it would work

    for block in blocks:
        for line in block.get_lines():
            source(line,block) # Check if value is a source
            sink(line,block) # Check if value is a sink
            if flow:
                print("FLOW")
                sys.exit(0)  # We can exit the program. No need to continue running
                

        # ====================================================================================
            # HANDLE INSTRUCTIONS HERE

            # MATH
            if("add" in line) or ("sub" in line) or ("mul" in line) or ("div" in line):
                mathInst(line,block)

            # ICMP
            if ("icmp" in line):
                compareInst(line,block)

            # LOAD
            if ("load" in line):
                loadInst(line,block)


            # STORE
            if ("store" in line):
                storeInst(line,block)

            # GEP
            if ("getelementptr" in line):
                gepInst(line,block)


        # ====================================================================================
        # If at end of block, propagate values across edges
        # 
            if line == block.get_terminator():
                for edge in block.get_edges(): # Iterate over edge blocks to propagate taint values
                    for taintVal in block.get_vals():
                        edge.addVal(taintVal)  # Add each tainted value to the edge block tainted set
        # =================================================
    
    print("NO FLOW")
    
        

def mathInst(line, block):  # checks if using tainted value, if so propagate taint
    lhs = line.split()[0]
    tainted = False
    for val in block.get_vals():
        if val in line:  # If we have a tainted value on the rhs 
            tainted = True
    if tainted:
        block.addVal(lhs)
    return
# Math and Compare are the same as of now. Separating into different functions for 
def compareInst(line,block):
    lhs = line.split()[0]
    tainted = False
    for val in block.get_vals():
        if val in line:
            tainted = True
    if tainted:
        block.addVal(lhs)
    return

def loadInst(line,block):
    # %a2 = load i32, ptr %aVar

    # Case 1: Load tainted val into variable


    # Case 2: Overwrite tainted val
    return

def storeInst(line,block):

    #  - store i32 <opd1>, ptr <opd2>


    # Case 1: Tainted val stored into new variable
    # opd 1 is tainted value

    # Case 2: Overwriting tainted val
    return

def gepInst(line,block):
    return

if __name__ == "__main__":
    main()