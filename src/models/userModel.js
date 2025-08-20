const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'O nome é obrigatório.'],
    },
    email: {
      type: String,
      required: [true, 'O email é obrigatório.'],
      unique: true,
      lowercase: true,
      match: [/\S+@\S+\.\S+/, 'Por favor, use um email válido.'],
    },
    password: {
      type: String,
      required: [true, 'A senha é obrigatória.'],
      minlength: 6,
    },
  },
  {
    timestamps: true,
  }
);

// Middleware (hook) do Mongoose que é executado ANTES de salvar o documento
userSchema.pre('save', async function (next) {
  // Se a senha não foi modificada, não faz nada e continua
  if (!this.isModified('password')) {
    return next();
  }

  // Gera o "salt" e criptografa a senha
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
