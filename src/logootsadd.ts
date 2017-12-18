/*
 *  Copyright 2014 Matthieu Nicolas
 *
 *  This file is part of Mute-structs.
 *
 *  Mute-structs is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  Mute-structs is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with Mute-structs.  If not, see <http://www.gnu.org/licenses/>.
 */

import {SafeAny} from "safe-any"

import {Identifier} from './identifier'
import {LogootSRopes} from './logootsropes'
import {TextInsert} from './textinsert'


/**
 * Represents a LogootSplit insert operation.
 */
export class LogootSAdd {

    /**
    * @constructor
    * @param {Identifier} id - the identifier that localise the insertion in the logoot sequence.
    * @param {string} content - the content of the block to be inserted.
    */
    constructor (id: Identifier, content: string) {
        console.assert(content.length > 0, "content must not be empty")

        this.id = id
        this.content = content
    }

    static fromPlain (o: SafeAny<LogootSAdd>): LogootSAdd | null {
        if (typeof o === "object" && o !== null) {
            const plainId: SafeAny<Identifier> = o.id
            const content: SafeAny<string> = o.content
            if (typeof content === "string" && content.length > 0) {
                const id: Identifier | null = Identifier.fromPlain(plainId)
                if (id !== null) {
                    return new LogootSAdd(id, content)
                }
            }

            // For backward compatibility
            // Allow to replay and update previous log of operations
            const l: SafeAny<string> = o["l"]
            if (typeof l === "string" && l.length > 0) {
                const id: Identifier | null = Identifier.fromPlain(plainId)
                if (id !== null) {
                    return new LogootSAdd(id, l)
                }
            }
        }
        return null
    }

    readonly id: Identifier

    readonly content: string

    equals (aOther: LogootSAdd): boolean {
        return this.id.equals(aOther.id) &&
            this.content === aOther.content
    }

    /**
    * Apply the current insert operation to a LogootSplit document.
    * @param {LogootSRopes} doc - the LogootSplit document on which the operation wil be applied.
    * @return {TextInsert[]} the insertion to be applied on the sequence representing the document content.
    */
    execute (doc: LogootSRopes): TextInsert[] {
        return doc.addBlock(this.content, this.id)
    }

}
