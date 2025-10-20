#!/usr/bin/python3

import sys


class Block:
    def __init__(self, name, funcID):
        self.name = name
        self.contents = []
        self.funcID = funcID
        self.done = False

def getPseudoInstruction(line):
    if not line or line.startswith(";"):
        return None
    check = line.split()
    if len(check) == 1 and ":" in check[0]:
        return check[0].split('STOP')[0]
    elif check[0][0] == '%':
        return check[2]
    elif check[0][0] != '%' and len(check) > 1:
        return check[0]
    return None

def splitBlock(block):
    newBlocks = []
    splitIndices = []
    for i in range(len(block.contents)):
        if getPseudoInstruction(block.contents[i]) == "call":
            splitIndices.append(i+1)
    start = 0
    edges = []
    for split in splitIndices:
        if start == 0:
            newBlock = Block(block.name, block.funcID)

        else:
            newBlock = Block(block.name+str(split), block.funcID)
        newBlock.contents = block.contents[start:split]
        newBlocks.append(newBlock)
        start = split
        edges.append(newBlock.name + " -> " + newBlock.name+str(split))
        endblock = newBlock
    if start < len(block.contents):
        newBlock = Block(block.name+str(split), block.funcID)
        newBlock.contents = block.contents[split:]
        newBlocks.append(newBlock)
        endblock = newBlock
    terminator = endblock.contents[len(endblock.contents)-1]
    
    if getPseudoInstruction(terminator) == "br":
        terminator = terminator.split()
        if terminator[1] == "label":
            destination = terminator[2].split("%")[1].split('STOP')[0]
            edges.append(block.name + " -> " + destination)
        else:
            destination1 = terminator[4].strip("%").strip(",")
            edges.append(block.name + " -> " + destination1)
            destination2 = terminator[6].strip("%").strip("STOP")
            edges.append(block.name + " -> " + destination2)
    return (newBlocks, edges)

def CFG(blocksStart, funcName):
    edges = []
    blocks = blocksStart
    while True:
        for i in range(len(blocks)):
            block = blocks[i]
            blockSplit = False
            for line in block.contents:
                check = line.split()
                if getPseudoInstruction(line) == "call":
                    newBlocksAndEdges = splitBlock(block)
                    blocks.pop(i)
                    for j in range(len(newBlocksAndEdges[0])):
                        blocks.append(newBlocksAndEdges[0][j])
                    for k in range(len(newBlocksAndEdges[1])):
                        edges.append(newBlocksAndEdges[1][k])
                    blockSplit = True
                if blockSplit:
                    break
            terminator = block.contents[len(block.contents)-1]
            if getPseudoInstruction(terminator) == "br":
                terminator = terminator.split()
                if terminator[1] == "label":
                    destination = terminator[2].split("%")[1].split('STOP')[0]
                    edges.append(block.name + " -> " + destination)
                else:
                    destination1 = terminator[4].strip("%").strip(",")
                    edges.append(block.name + " -> " + destination1)
                    destination2 = terminator[6].strip("%").strip("STOP")
                    edges.append(block.name + " -> " + destination2)
        break
    writeDOT(funcName, blocks, edges)
        
def writeDOT(funcName, blocks, edges):
    filename = f"{funcName}.dot"
    with open(filename, 'w') as f:
        tracker = []
        f.write(f"digraph {funcName} {{\n")
        for block in blocks:
            f.write(f'    {block.name} [shape=record, label="{block.name}"];\n')
        duplicate = False
        for edge in edges:
            newedge = edge.split(" -> ")[0]
            for i in range(len(tracker)):
                if newedge == tracker[i][0]:
                    duplicate = True
                    tracker[i][1] += 1
                    break
                else:
                    duplicate = False
            if duplicate:
                f.write(f'    {edge} [label={tracker[i][1]}];\n')
            if not duplicate:
                tracker.append([newedge, 0])
                f.write(f"    {edge} [label=0];\n")
        f.write("}\n")
    print(tracker)
    print(f"Generated {filename}")

llvm_file = sys.argv[1]
print("You are analyzing " + llvm_file)
file = open(llvm_file, 'r')
handle = file.read().split('\n')
funcCount = -1
funcNames = []
blocks = []
lines = []
for line in handle:
    line += 'STOP'
    if (("define" in line) and ("@" in line)):
        funcCount += 1
        funcName = line.split('@')[1].split('(')[0]
        funcNames.append(funcName)
        blocks.append(Block("entry", funcCount))
    else:
        instr = getPseudoInstruction(line)
        if instr is None or instr == "entry:" or instr == "declare":
            continue
        if ":" in instr:
            blocks.append(Block(instr.strip(":"), funcCount))
        else:
            blocks[len(blocks) - 1].contents.append(line)

for i in range(0, funcCount+1):
    blocks1 = []
    for j in range(len(blocks)):
        if blocks[j].funcID == i:
            blocks1.append(blocks[j])
    CFG(blocks1, funcNames[i])
        
