package com.example.grammarfix

import android.content.Context
import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.example.grammarfix.databinding.ActivityApiKeyBinding

class ApiKeyActivity : AppCompatActivity() {

    private lateinit var binding: ActivityApiKeyBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityApiKeyBinding.inflate(layoutInflater)
        setContentView(binding.root)

        val existing = getSharedPreferences("prefs", Context.MODE_PRIVATE)
            .getString("api_key", "")
        if (!existing.isNullOrBlank()) {
            binding.etApiKey.setText(existing)
        }

        binding.btnSave.setOnClickListener {
            val key = binding.etApiKey.text?.toString()?.trim() ?: ""
            if (key.isBlank() || !key.startsWith("sk-ant-")) {
                Toast.makeText(this, "Enter a valid Anthropic API key (starts with sk-ant-)", Toast.LENGTH_LONG).show()
                return@setOnClickListener
            }
            getSharedPreferences("prefs", Context.MODE_PRIVATE).edit()
                .putString("api_key", key)
                .apply()
            Toast.makeText(this, "API key saved!", Toast.LENGTH_SHORT).show()
            finish()
        }
    }
}
