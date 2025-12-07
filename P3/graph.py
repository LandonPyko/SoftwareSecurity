import sys

class Block:  # Basic Block class to store data on each block
    def __init__(self,leader):
        self.leader = leader
        self.body = []
        self.terminator = ""
        self.edges = []
        self.label = ""
        self.taintVals = set()
        self.prevTaintVals = set()
        self.size = 1
        self.lines = []
    
    def get_leader(self):
        return self.leader
    def get_body(self):
        return self.body
    def get_terminator(self):
        return self.terminator
    def get_edges(self):
        return self.edges
    def get_label(self):
        return self.label
    def get_size(self):
        return self.size
    def get_lines(self):
        return self.lines
    def get_vals(self):
        return self.taintVals
    def get_prevVals(self):
        return self.prevTaintVals
    
    def set_terminator(self,terminator):
        self.terminator = terminator

    def add_body(self,line):
        self.body.append(line)

    def add_edge(self,block):
        self.edges.append(block)

    def set_label(self,label):
        self.label = label

    def set_size(self,num):
        self.size += num
    
    def set_lines(self):
        self.lines = [self.leader] + self.body + [self.terminator]

    def addVal(self,val):
        self.taintVals.add(val)

def main():
    if (len(sys.argv) == 1):
        raise RuntimeError("Must provide input file")
    
    arg = sys.argv[1]
    file = open(arg,"r")
    lines = file.readlines()
    
    strippedLines = [line.strip() for line in lines]  # new list because strings are immutable
    functions = [] # 2D List to hold each function to run

    # For handling the possibility of multiple functions. Also allows us to ignore global allocations
    for i in range(len(strippedLines)):

        if ("define" in strippedLines[i]): # If we are at a new function definition
            newFunc = [strippedLines[i]]
            # Iterate from define to the end of the function
            for j in range(i+1,len(strippedLines)):
                
                newFunc.append(strippedLines[j])
                if (strippedLines[j].endswith('}')):
                    break
            functions.append(newFunc)       
    
    for func in functions:
        strippedFunc = []
        for line in func:
            if line != "":
                strippedFunc.append(line)
        blocksOut = run(strippedFunc)
    file.close()
    return blocksOut

def run(function):
    markedLines = mark(function)
    blocks = buildGraph(markedLines,function)
    createEdges(blocks,function)
    for block in blocks:
        block.set_lines()
        if (block.get_leader() != block.get_terminator()):  # If leader and terminator are different instructions (so at least two lines)
            block.set_size(1+len(block.get_body()))
    # Output graph here?
    func = function[0].split()
    nameIndex = func[2].index('(') # func definition is always "define {type} @name"
    funcName = func[2][1:nameIndex] # Get the slice of the function name

    outputGraph(blocks,funcName)
    return blocks

def mark(lines):

    status = [0]* (len(lines)-1)  # Populate empty list
    if (lines[1].endswith(':')):  # If there is an entry label
        status[2] = 1
    else:
        status[1] = 1 # First instruction is leader
    
    # 1 for leader, 2 for terminator, 3 for leader AND terminator, 0 otherwise

    # ================= Leader Marking =================

    # First leader

    # Find other leaders
    for i in range(2,len(lines)-1):
        if(lines[i].endswith(':')):  # I think this may be redundancy for the entry block but I'm going to leave it for now
            status[i+1] = 1
    
    # The instruction after a terminator may need to be tweaked

    
    # Terminator Marking
    for i in range(len(lines)):
        if "call" in lines[i]: # Handle call separately because it's tricky
            if status[i] == 1:
                status[i] = 3
            else:
                status[i] = 2
            status[i+1] = 1
        elif lines[i].startswith("ret") or lines[i].startswith("br"):
            if status[i] == 1:
                status[i] = 3
            else:
                status[i] = 2

    return status

def buildGraph(status,lines):
    blocks = []
    # create blocks here
    for i in range(len(status)):
        if (status[i] == 1):
            basic_block = Block(lines[i])  # Create basic block with leader
            if (i == 1):
                basic_block.set_label("Start")
            else:
                if (lines[i-1].endswith(':')):
                    labelName = lines[i-1]
                    basic_block.set_label(labelName[:len(labelName)-1]) # Instruction before it is a label
                else:
                    out = lines[i-1].split()
                    for word in out:
                        if word.startswith('@'):
                            funcIndex = word.index("(")
                            funcName = word[1:funcIndex]
                            basic_block.set_label("after_" + funcName + str(i))  # Add line number at the end for uniqueness

            for j in range(i+1,len(status)): # It can at most go for the rest of the function
                if (status[j] == 0):
                    basic_block.add_body(lines[j])
                elif (status[j] == 2):
                    basic_block.set_terminator(lines[j])
                    i = j
                    break
            
            blocks.append(basic_block)
        if (status[i] == 3):
            basic_block = Block(lines[i])
            if (lines[i-1].endswith(':')): # If a single-line block OR call at the beginning of the block
                basic_block.set_label(lines[i-1][:len(lines[i-1])-1])
            else: # Otherwise it's two 3's back to back. This only happens when you have a call followed by a jump
                out = lines[i-1].split()
                for word in out:
                    if word.startswith('@'):
                        funcIndex = word.index("(")
                        funcName = word[1:funcIndex]
                        basic_block.set_label("after_" + funcName + str(i))  # Add line number at the end for uniqueness
                
        # Think I have redundancy here with these two blocks. Can clean up at a later time

            basic_block.set_terminator(lines[i])
            blocks.append(basic_block)
    
    # Create dummy return block and append it to block list
    retBlock = Block("")
    retBlock.set_label("return")
    retBlock.set_terminator("")
    blocks.append(retBlock)

    return blocks

def createEdges(blocks,lines):

    # Iterate over blocks and refer to original lines to access labels
    
    for i in range(len(blocks)):
        labels = []
        terminator = blocks[i].get_terminator()
        termList = terminator.split()  # Create a list of strings for indexing and easy access
        for j in range(len(termList)):
            if (termList[j] == "label"):
                
                label = termList[j+1]

                if (label[len(label)-1]== ','):  # If in a br with multiple paths, get rid of the comma
                    label = label[:len(label)-1]
                labels.append(label[1:])  # Skip over the %

        # Once labels are found, go through and find the actual line
        edgeInstructions = [] 
        for k in range(len(labels)):
            if (labels[k]+':' in lines):
                lineIndex = lines.index(labels[k] + ':')
                edgeInstructions.append(lines[lineIndex+1])
            
        # Transition from instruction -> block, and add block to edge list
        for instruction in edgeInstructions:
            for blockEdge in blocks:
                if (blockEdge.get_leader() == instruction):
                    blocks[i].add_edge(blockEdge)

        # Handle returns
        if (blocks[i].get_terminator().startswith("ret")):  # All returns will link to a dummy return block
            blocks[i].add_edge(blocks[len(blocks)-1])
        # Handle calls
        if ("call" in blocks[i].get_terminator()):
            blocks[i].add_edge(blocks[i+1])
    
def outputGraph(blocks,name):

    outputFile = name + ".dot"
    output = open(outputFile, 'w')

    graphOut = []  # Have output be an array that we can write each line individually to the file
    
    for block in blocks: # Create the output graph based on the basic blocks
        graphOut.append('\t' + block.get_label() + " [shape=record,label=" + block.get_label() + "]" + "\n") # Node definition
        edges = block.get_edges()
        for i in range(len(edges)):
            graphOut.append('\t' + block.get_label() + " -> " + edges[i].get_label() + "[label=" + str(i) + "]\n") # Edge definition

    # Output to .dot
    output.write("digraph{\n")
    for line in graphOut: # Write each line
        output.write(line)
    output.write("}")

if __name__ == "__main__":
    main()