/*
    This file is part of MUTE-structs.

    Copyright (C) 2017  Matthieu Nicolas, Victorien Elvinger

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import test from "ava"

import {flatten, isSorted} from "../src/helpers.js"
import {Identifier} from "../src/identifier"
import {IdentifierInterval} from "../src/identifierinterval"
import {randomInt32} from "../src/int32.js"
import {RenamableLogootSAdd} from "../src/operations/insert/renamablelogootsadd.js"
import {Ordering} from "../src/ordering.js"
import {RenamableReplicableList} from "../src/renamablereplicablelist.js"
import {generateStr} from "./helpers.js"

test("basic-insert-del-string", (t) => {
    const replicaNumberA = 1
    const docA = new RenamableReplicableList(replicaNumberA)
    const replicaNumberB = 2
    const docB = new RenamableReplicableList(replicaNumberB)

    const event1 = docA.insertLocal(0, "hello world")
    const event2 = docA.delLocal(6, 9)

    event1.execute(docB)
    event2.execute(docB)

    t.is(docA.str, docB.str, "docA.str = docB.str")
    t.is(docA.digest(), docB.digest(), "docA.digest() = docB.digest()")
})

test("local-rename", (t) => {
    const expectedStr = "hello world"
    const replicaNumberA = 1
    const docA = new RenamableReplicableList(replicaNumberA)

    docA.insertLocal(0, "helod")
    docA.delLocal(4, 5)
    docA.insertLocal(4, " world")
    docA.insertLocal(2, "l")

    docA.renameLocal()

    t.is(docA.str, expectedStr, `docA.str = ${expectedStr}`)
    t.is(docA.getNbBlocks(), 1, "docA.getNbBlocks() = 1")
})

test("basic-rename", (t) => {
    const replicaNumberA = 1
    const docA = new RenamableReplicableList(replicaNumberA)
    const replicaNumberB = 2
    const docB = new RenamableReplicableList(replicaNumberB)

    const event1 = docA.insertLocal(0, "helo")
    event1.execute(docB)
    const event2 = docB.insertLocal(4, " world")
    event2.execute(docA)
    const event3 = docA.insertLocal(2, "l")
    event3.execute(docB)

    const renameOp = docA.renameLocal()
    renameOp.execute(docB)

    t.is(docA.str, docB.str, "docA.str = docB.str")
    t.is(docA.getNbBlocks(), docB.getNbBlocks(), "docA.getNbBlocks() = docB.getNbBlocks()")
    t.is(docA.digest(), docB.digest(), "docA.digest() = docB.digest()")
})

test("rename-then-concurrent-insert", (t) => {
    const replicaNumberA = 1
    const docA = new RenamableReplicableList(replicaNumberA)
    const replicaNumberB = 2
    const docB = new RenamableReplicableList(replicaNumberB)

    const event1 = docA.insertLocal(0, "helo")
    event1.execute(docB)
    const event2 = docB.insertLocal(4, " wor")
    event2.execute(docA)
    const event3 = docA.insertLocal(8, "ld")
    event3.execute(docB)

    docA.renameLocal()
    const concurrentInsert = docB.insertLocal(2, "l")

    concurrentInsert.execute(docA)

    const expectedStr = "hello world"
    const expectedNbBlocks = 3
    t.is(docA.str, expectedStr, `docA.str = ${expectedStr}`)
    t.is(docA.getNbBlocks(), expectedNbBlocks, `docA.getNbBlocks() = ${expectedNbBlocks}`)
})

test("insert-then-concurrent-rename", (t) => {
    const replicaNumberA = 1
    const docA = new RenamableReplicableList(replicaNumberA)
    const replicaNumberB = 2
    const docB = new RenamableReplicableList(replicaNumberB)

    const event1 = docA.insertLocal(0, "helo")
    event1.execute(docB)
    const event2 = docB.insertLocal(4, " wor")
    event2.execute(docA)
    const event3 = docA.insertLocal(8, "ld")
    event3.execute(docB)

    const concurrentRename = docA.renameLocal()
    docB.insertLocal(2, "l")

    concurrentRename.execute(docB)

    const expectedStr = "hello world"
    const expectedNbBlocks = 3
    t.is(docB.str, expectedStr, `docB.str = ${expectedStr}`)
    t.is(docB.getNbBlocks(), expectedNbBlocks, `docB.getNbBlocks() = ${expectedNbBlocks}`)
})

test("rename-then-concurrent-delete", (t) => {
    const replicaNumberA = 1
    const docA = new RenamableReplicableList(replicaNumberA)
    const replicaNumberB = 2
    const docB = new RenamableReplicableList(replicaNumberB)

    const event1 = docA.insertLocal(0, "helllo")
    event1.execute(docB)
    const event2 = docB.insertLocal(6, " wor")
    event2.execute(docA)
    const event3 = docA.insertLocal(10, "ld")
    event3.execute(docB)

    docA.renameLocal()
    const concurrentDelete = docB.delLocal(2, 2)

    concurrentDelete.execute(docA)

    const expectedStr = "hello world"
    const expectedNbBlocks = 2
    t.is(docA.str, expectedStr, `docA.str = ${expectedStr}`)
    t.is(docA.getNbBlocks(), expectedNbBlocks, `docA.getNbBlocks() = ${expectedNbBlocks}`)
})

test("delete-then-concurrent-rename", (t) => {
    const replicaNumberA = 1
    const docA = new RenamableReplicableList(replicaNumberA)
    const replicaNumberB = 2
    const docB = new RenamableReplicableList(replicaNumberB)

    const event1 = docA.insertLocal(0, "helllo")
    event1.execute(docB)
    const event2 = docB.insertLocal(6, " wor")
    event2.execute(docA)
    const event3 = docA.insertLocal(10, "ld")
    event3.execute(docB)

    const concurrentRename = docA.renameLocal()
    docB.delLocal(2, 2)

    concurrentRename.execute(docB)

    const expectedStr = "hello world"
    const expectedNbBlocks = 2
    t.is(docB.str, expectedStr, `docB.str = ${expectedStr}`)
    t.is(docB.getNbBlocks(), expectedNbBlocks, `docB.getNbBlocks() = ${expectedNbBlocks}`)
})

test("sanity-check", (t) => {
    // Looking for bugs in renameId() and reverseRenameId()
    // Try to generate a counter-example here
    const replicaNumberA = 1
    const docA = new RenamableReplicableList(replicaNumberA)
    const replicaNumberB = 2
    const docB = new RenamableReplicableList(replicaNumberB)

    const compareFn = (id1: Identifier, id2: Identifier): Ordering => id1.compareTo(id2)

    const getIdsFn = (doc: RenamableReplicableList): Identifier[] => {
        const idIntervalToIdsFn = (idInterval: IdentifierInterval) => idInterval.toIds()
        return doc.getList().toList().map(idIntervalToIdsFn).reduce(flatten)
    }

    const isValidFn = (doc: RenamableReplicableList): boolean => {
        return isSorted(getIdsFn(doc), compareFn)
    }

    const performRandomInsertsFn = (n: number) => {
        for (let i = 0; i < n; i ++) {
            const strA = generateStr(randomInt32(1, 10))
            const posA = randomInt32(0, docA.str.length)

            const insertOpA = docA.insertLocal(posA, strA)

            const strB = generateStr(randomInt32(1, 10))
            const posB = randomInt32(0, docB.str.length)

            const insertOpB = docB.insertLocal(posB, strB)

            insertOpA.execute(docB)
            insertOpB.execute(docA)
        }
    }

    const initInsert = docA.insertLocal(0, "Hello world")
    initInsert.execute(docB)

    performRandomInsertsFn(100)

    t.is(docA.str, docB.str, "docA.str = docB.str")
    t.is(docA.digest(), docB.digest(), "docA.digest() = docB.digest()")
    t.true(isValidFn(docA), "docA should be a valid document")

    const renameOp = docA.renameLocal()

    const concurrentInserts = []
    for (let i = 0; i < 50; i++) {
        const strB = Array.from({length: randomInt32(1, 10)}).fill("X").join("")
        const posB = randomInt32(0, docB.str.length)

        const insertOpB = docB.insertLocal(posB, strB)
        concurrentInserts.push(insertOpB)
    }

    concurrentInserts.forEach((insertOp: RenamableLogootSAdd) => {
        insertOp.execute(docA)
    })

    renameOp.execute(docB)

    t.is(docA.str, docB.str, "docA.str = docB.str")
    t.is(docA.digest(), docB.digest(), "docA.digest() = docB.digest()")
    t.true(isValidFn(docA), "docA should be a valid document")

    performRandomInsertsFn(500)

    t.is(docA.str, docB.str, "docA.str = docB.str")
    t.is(docA.digest(), docB.digest(), "docA.digest() = docB.digest()")
    t.true(isValidFn(docA), "docA should be a valid document")

    const renamingMap = docA.currentExtendedRenamingMap
    const ids = getIdsFn(docA)
    const revertedIds = ids.map((id: Identifier): Identifier => {
        return renamingMap.reverseRenameId(id)
    })

    for (let i = 1; i < revertedIds.length - 1; i++) {
        const predecessorId = ids[i - 1]
        const id = ids[i]
        const successorId = ids[i + 1]

        const revertedPredecessorId = revertedIds[i - 1]
        const revertedId = revertedIds[i]
        const revertedSuccessorId = revertedIds[i + 1]

        if (revertedPredecessorId.compareTo(revertedId) !== Ordering.Less) {

            console.log("pid: " + predecessorId)
            console.log(" id: " + id)
            console.log("sid: " + successorId)
            console.log("rpid: " + revertedPredecessorId)
            console.log(" rid: " + revertedId)
            console.log("rsid: " + revertedSuccessorId)

            t.fail("reverseRenameId() should not change the order between ids")
        }
    }

})
