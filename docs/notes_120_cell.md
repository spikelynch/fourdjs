
Steps forward -

1. algorithm which, given a face, finds the two dodecahedra it belongs to

2. using this, generate a list of all 120 dodecahedra:

[ a b c d e f g h i j k l m n o p q r s t ] <- 20 vertices

Check that each vertex appears in four of these

Then - either manually start labelling them, or build an interface to help
with the manual labelling



1.

For a face: there are five edges, and ten other faces sharing an edge.

These edges are in two sets: one for each dodecahedron. The sets are defined
by them sharing vertices which aren't in the first face.

Go around a set of five, by pairs: for each pair, find the other neighbour - 

this gives the next five faces.

There's only one face left, which is defined by the shared other vertices of 
the last five.









/// old shit below that didn't work VVVV


Chords: 1.74806 - the 120-cell has 7200 chords of this length

Looking for a way to partition the 600 vertices of the 120 cell into five
disjoint 600-cells, each of which has 120 vertices.

(there are 10 such 600-cells so two ways to do the partition I guess)

a 600-cell has 720 edges! optimistically this means that each chord in the
collection of 7200 belongs to one and only one of the 600-cells.


the way forward:

I need to take the 7200 chords (pairs of nodes) and divide them into sets
which are connected to one another - with any luck, each of these will be
one of the 10 600-cells

Then need to sort these 10 sets of 120 vertices into the two sets of 5


collate chords by node

Each 120-cell vertex has 24 of the chord3s from it - as a 600-cell has 12
edges to each vertex, this suggests that each 120-vertex belongs to two 
600-cells with a disjoint set of vertices

Next algorithm - gather each 600-cell

use the chords as the basis for this.

n1 -> 24 chords -> add these 24 neighbours

bad luck - traversing chord3s from the first vertex reaches all 600 vertices-
which isn't suprising as the two 5 disjoint sets overlap. Sigh.

Use the angles between the chords? seems a bit complex

Get the angles from the 600-cell model. Use these to separate out the sets of
24 chords from a point on the 120-cell.

Notes from dinner:

- all of the 60-degree angles are chords joining the vertices of the tetrahedra
  - there should be two sets of these

for eg - this works for the chords from 1!

    [ 25, 41 ],
    [ 25, 97 ],
    [ 25, 109 ],
    [ 25, 157 ],
    [ 25, 161 ],  
    [ 41, 97 ],
    [ 41, 109 ],
    [ 41, 173 ],
    [ 41, 177 ],
 	[ 97, 113 ],
 	[ 97, 161 ],
    [ 97, 177 ],
    [ 37, 53 ],
    [ 37, 93 ],
    [ 37, 113 ],
    [ 37, 157 ],
    [ 37, 161 ],
    [ 53, 93 ],
    [ 53, 113 ],
    [ 53, 173 ],
    [ 53, 177 ],
	[ 173, 177 ]
    [ 93, 109 ],
	[ 93, 157 ],
	[ 93, 173 ],   
 	[ 109, 157 ],
 	[ 109, 173 ],
	[ 113, 161 ],
	[ 113, 177 ],
    [ 157, 161 ],  


    [ 29, 45 ],     5
    [ 29, 101 ],    101
    [ 29, 105 ],    105
    [ 29, 153 ],    153
    [ 29, 165 ],    165
    [ 45, 101 ],    
    [ 45, 105 ],
    [ 45, 169 ],    169
    [ 45, 181 ],    181
	[ 101, 117 ],   117
	[ 101, 165 ],   
	[ 101, 181 ],
    [ 105, 153 ],  
    [ 105, 169 ],
    [ 33, 49 ],     33 49
    [ 33, 89 ],     89
    [ 33, 117 ],
    [ 33, 153 ],
    [ 33, 165 ],
    [ 49, 89 ],
    [ 49, 117 ],
    [ 49, 169 ],
    [ 49, 181 ],
	[ 169, 181 ],
    [ 89, 105 ],
    [ 89, 153 ],
    [ 89, 169 ],
    [ 117, 165 ],
    [ 117, 181 ],
	[ 153, 165 ], 
    

So each of these is one of the two icosahedral pyramids from node 1.

Doing this manually for the rest of the partition is possible, but could it
be automated based on angles?



Plan for Sunday:

* use the existing label_subgraph to make a function which partitions the
  60-angle chords into two groups (like I did manually above)

  // this is done and seems to work

* test this labelling manually (ie colour one set of 60-angle vertices)

  // done this with the manual labels and it looks good

* make another labeling routine which can fill out the rest of the 600-cell
  from the starting dodecahedron, by only following chords which are at 60
  to the entering chord

Then the big algorithm does the following:

- start from node 1, find 60-angles, pick one partition at random, label that 600-cell

- find the next unlabelled node

- find 60-angles, partition them, pick a partition with no unlabelled cells and label that 600-cell

- repeat the previous step for the remaining three 600-cells

Alternative, more manual option: just write the second labelling routine and
do the rest by hand


    [ 25, 41 ],
    [ 25, 97 ],
    [ 25, 109 ],
    [ 25, 157 ],
    [ 25, 161 ],  
    [ 41, 97 ],
    [ 41, 109 ],
    [ 41, 173 ],
    [ 41, 177 ],
 	[ 97, 113 ],
 	[ 97, 161 ],
    [ 97, 177 ],
    [ 37, 53 ],
    [ 37, 93 ],
    [ 37, 113 ],
    [ 37, 157 ],
    [ 37, 161 ],
    [ 53, 93 ],
    [ 53, 113 ],
    [ 53, 173 ],
    [ 53, 177 ],
	[ 173, 177 ]
    [ 93, 109 ],
	[ 93, 157 ],
	[ 93, 173 ],   
 	[ 109, 157 ],
 	[ 109, 173 ],
	[ 113, 161 ],
	[ 113, 177 ],
    [ 157, 161 ],  
25 41 97 109
157 161 173 177
113 37 53 93


