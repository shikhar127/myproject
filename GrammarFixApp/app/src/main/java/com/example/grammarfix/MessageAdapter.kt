package com.example.grammarfix

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.graphics.Color
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import android.widget.Toast
import androidx.recyclerview.widget.RecyclerView

class MessageAdapter(private val messages: MutableList<Message>) :
    RecyclerView.Adapter<MessageAdapter.MessageViewHolder>() {

    inner class MessageViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val tvLabel: TextView = view.findViewById(R.id.tvLabel)
        val tvMessage: TextView = view.findViewById(R.id.tvMessage)
        val tvCopy: TextView = view.findViewById(R.id.tvCopy)
        val bubbleContainer: ViewGroup = view.findViewById(R.id.bubbleContainer)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): MessageViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_message, parent, false)
        return MessageViewHolder(view)
    }

    override fun onBindViewHolder(holder: MessageViewHolder, position: Int) {
        val message = messages[position]

        when (message.type) {
            MessageType.ORIGINAL -> {
                holder.tvLabel.text = "YOU"
                holder.tvMessage.text = message.text
                holder.tvMessage.setTextColor(Color.parseColor("#F0F0F0"))
                holder.bubbleContainer.setBackgroundResource(R.drawable.bg_bubble)
                holder.tvCopy.visibility = View.GONE
            }
            MessageType.FIXED -> {
                holder.tvLabel.text = "✦ FIXED"
                holder.tvLabel.setTextColor(Color.parseColor("#E07B3F"))
                holder.tvMessage.text = message.text
                holder.tvMessage.setTextColor(Color.parseColor("#F0F0F0"))
                holder.bubbleContainer.setBackgroundColor(Color.parseColor("#2A1F0E"))
                setRoundedBackground(holder.bubbleContainer)
                holder.tvCopy.visibility = View.VISIBLE
                holder.tvCopy.setOnClickListener {
                    val clipboard = it.context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                    clipboard.setPrimaryClip(ClipData.newPlainText("Fixed text", message.text))
                    Toast.makeText(it.context, "Copied!", Toast.LENGTH_SHORT).show()
                }
            }
            MessageType.ERROR -> {
                holder.tvLabel.text = "ERROR"
                holder.tvLabel.setTextColor(Color.parseColor("#CF6679"))
                holder.tvMessage.text = message.text
                holder.tvMessage.setTextColor(Color.parseColor("#CF6679"))
                holder.bubbleContainer.setBackgroundResource(R.drawable.bg_bubble)
                holder.tvCopy.visibility = View.GONE
            }
            MessageType.LOADING -> {
                holder.tvLabel.text = "✦ FIXING…"
                holder.tvLabel.setTextColor(Color.parseColor("#E07B3F"))
                holder.tvMessage.text = "Correcting grammar…"
                holder.tvMessage.setTextColor(Color.parseColor("#888888"))
                holder.bubbleContainer.setBackgroundResource(R.drawable.bg_bubble)
                holder.tvCopy.visibility = View.GONE
            }
        }
    }

    private fun setRoundedBackground(view: ViewGroup) {
        view.background = view.context.getDrawable(R.drawable.bg_bubble_fixed)
    }

    override fun getItemCount() = messages.size

    fun addMessage(message: Message): Int {
        messages.add(message)
        notifyItemInserted(messages.size - 1)
        return messages.size - 1
    }

    fun updateMessage(index: Int, message: Message) {
        if (index in messages.indices) {
            messages[index] = message
            notifyItemChanged(index)
        }
    }

    fun clear() {
        val size = messages.size
        messages.clear()
        notifyItemRangeRemoved(0, size)
    }
}
