package com.example.grammarfix

import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.view.View
import android.view.inputmethod.InputMethodManager
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import com.example.grammarfix.databinding.ActivityMainBinding
import kotlinx.coroutines.launch

class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding
    private lateinit var viewModel: MainViewModel
    private lateinit var adapter: MessageAdapter
    private val messages = mutableListOf<Message>()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        viewModel = ViewModelProvider(this)[MainViewModel::class.java]

        setupRecyclerView()
        setupClickListeners()
        observeEvents()
        checkApiKey()
    }

    private fun setupRecyclerView() {
        adapter = MessageAdapter(messages)
        binding.rvMessages.layoutManager = LinearLayoutManager(this).apply {
            stackFromEnd = true
        }
        binding.rvMessages.adapter = adapter
    }

    private fun setupClickListeners() {
        binding.btnFixGrammar.setOnClickListener { submitText() }
        binding.btnSend.setOnClickListener { submitText() }
        binding.btnClear.setOnClickListener {
            viewModel.clearMessages()
            binding.etInput.setText("")
        }
        binding.tvApiKeyHint.setOnClickListener {
            startActivity(Intent(this, ApiKeyActivity::class.java))
        }
    }

    private fun submitText() {
        val text = binding.etInput.text?.toString()?.trim() ?: return
        if (text.isEmpty()) return

        val apiKey = getApiKey()
        if (apiKey.isNullOrBlank()) {
            startActivity(Intent(this, ApiKeyActivity::class.java))
            return
        }

        binding.etInput.setText("")
        hideKeyboard()
        viewModel.fixGrammar(apiKey, text)
    }

    private fun observeEvents() {
        lifecycleScope.launch {
            viewModel.events.collect { event ->
                when (event) {
                    is UiEvent.AddMessage -> {
                        adapter.addMessage(event.message)
                        updateEmptyState()
                    }
                    is UiEvent.ReplaceLastMessage -> {
                        adapter.updateMessage(messages.size - 1, event.message)
                    }
                    is UiEvent.ClearMessages -> {
                        adapter.clear()
                        updateEmptyState()
                    }
                    is UiEvent.ScrollToBottom -> {
                        binding.rvMessages.post {
                            binding.rvMessages.scrollToPosition(messages.size - 1)
                        }
                    }
                }
            }
        }
    }

    private fun updateEmptyState() {
        binding.emptyState.visibility = if (messages.isEmpty()) View.VISIBLE else View.GONE
    }

    private fun checkApiKey() {
        if (getApiKey().isNullOrBlank()) {
            startActivity(Intent(this, ApiKeyActivity::class.java))
        }
    }

    private fun getApiKey(): String? {
        return getSharedPreferences("prefs", Context.MODE_PRIVATE)
            .getString("api_key", null)
    }

    private fun hideKeyboard() {
        val imm = getSystemService(Context.INPUT_METHOD_SERVICE) as InputMethodManager
        imm.hideSoftInputFromWindow(binding.root.windowToken, 0)
    }
}
