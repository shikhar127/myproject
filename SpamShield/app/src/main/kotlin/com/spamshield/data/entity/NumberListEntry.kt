package com.spamshield.data.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

/** block / allow list. The phone number is the key, plus an optional human label. */
@Entity(tableName = "number_list")
data class NumberListEntry(
    @PrimaryKey val number: String,
    val type: ListType,
    val label: String? = null,
)

enum class ListType { BLOCK, ALLOW }
