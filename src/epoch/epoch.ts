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

import {SafeAny} from "safe-any"

import {EpochId} from "./epochid"

export class Epoch {

    readonly id: EpochId
    readonly parentId?: EpochId

    constructor (id: EpochId, parentId?: EpochId) {
        console.assert(id.epochNumber !== 0 || (id.epochNumber === 0 && parentId !== undefined),
            "Epoch 0 does not have a parentId")
        console.assert(parentId !== undefined || (parentId === undefined && id.epochNumber === 0),
            "Only epoch 0 does not have a parentId")

        this.id = id
        this.parentId = parentId
    }
}