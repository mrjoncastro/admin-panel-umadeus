"use client";

import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import ModalAnimated from "@/components/ModalAnimated";
import SmoothTabs from "@/components/SmoothTabs";
import usePocketBase from "@/lib/hooks/usePocketBase";
import type { UserModel } from "@/types/UserModel";
import {
  searchBanks,
  createBankAccount,
  createPixKey,
  Bank,
} from "@/lib/bankAccounts";

interface BankAccountModalProps {
  open: boolean;
  onClose: () => void;
}

export default function BankAccountModal({ open, onClose }: BankAccountModalProps) {
  const pb = usePocketBase();
  const user = pb.authStore.model as unknown as UserModel | null;

  const [type, setType] = useState("bank");
  const [ownerName, setOwnerName] = useState("");
  const [accountName, setAccountName] = useState("");
  const [cpfCnpj, setCpfCnpj] = useState("");
  const [ownerBirthDate, setOwnerBirthDate] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankCode, setBankCode] = useState("");
  const [ispb, setIspb] = useState("");
  const [agency, setAgency] = useState("");
  const [account, setAccount] = useState("");
  const [accountDigit, setAccountDigit] = useState("");
  const [bankAccountType, setBankAccountType] = useState("conta_corrente");
  const [banks, setBanks] = useState<Bank[]>([]);
  const [pixAddressKey, setPixAddressKey] = useState("");
  const [pixAddressKeyType, setPixAddressKeyType] = useState("cpf");
  const [description, setDescription] = useState("");
  const [scheduleDate, setScheduleDate] = useState("");
  const [erro, setErro] = useState("");

  useEffect(() => {
    searchBanks("")
      .then(setBanks)
      .catch(() => setBanks([]));
  }, []);

  useEffect(() => {
    if (!bankName) {
      return;
    }
    const timeout = setTimeout(() => {
      searchBanks(bankName)
        .then(setBanks)
        .catch(() => setBanks([]));
    }, 300);
    return () => clearTimeout(timeout);
  }, [bankName]);

  const handleBankChange = (value: string) => {
    setBankName(value);
    const found = banks.find((b) => b.name === value);
    if (found) {
      setBankCode(String(found.code));
      setIspb(found.ispb);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      if (type === "pix") {
        await createPixKey(
          pb,
          {
            pixAddressKey,
            pixAddressKeyType,
            description,
            scheduleDate,
          },
          user.id,
          (user as UserModel & { cliente?: string }).cliente || user.id
        );
      } else {
        await createBankAccount(
          pb,
          {
            ownerName,
            accountName,
            cpfCnpj,
            ownerBirthDate,
            bankName,
            bankCode,
            ispb,
            agency,
            account,
            accountDigit,
            bankAccountType,
          },
          user.id,
          (user as UserModel & { cliente?: string }).cliente || user.id
        );
      }
      onClose();
    } catch (err) {
      console.error(err);
      setErro("Erro ao salvar.");
    }
  };

  return (
    <ModalAnimated open={open} onOpenChange={(v) => !v && onClose()}>
      <form onSubmit={handleSubmit} className="space-y-3 w-80">
        <Dialog.Title asChild>
          <h3 className="text-lg font-semibold text-center">Adicionar Conta</h3>
        </Dialog.Title>
        <Dialog.Description className="sr-only">Formulário de conta bancária</Dialog.Description>
        <SmoothTabs
          onChange={setType}
          defaultValue="bank"
          tabs={[
            {
              value: "bank",
              label: "Conta Bancária",
              content: (
                <div className="space-y-3">
                  <input
                    className="input-base"
                    placeholder="Nome do titular"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    required
                  />
                  <input
                    className="input-base"
                    placeholder="Nome da conta"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    required
                  />
                  <input
                    className="input-base"
                    placeholder="CPF/CNPJ"
                    value={cpfCnpj}
                    onChange={(e) => setCpfCnpj(e.target.value)}
                    required
                  />
                  <input
                    className="input-base"
                    type="date"
                    value={ownerBirthDate}
                    onChange={(e) => setOwnerBirthDate(e.target.value)}
                    required
                  />
                  <div>
                    <input
                      list="bank-list"
                      className="input-base"
                      placeholder="Banco"
                      value={bankName}
                      onChange={(e) => handleBankChange(e.target.value)}
                      required
                    />
                    <datalist id="bank-list">
                      {banks.map((b) => (
                        <option key={b.ispb} value={b.name} />
                      ))}
                    </datalist>
                  </div>
                  <input
                    className="input-base"
                    placeholder="Código do banco"
                    value={bankCode}
                    readOnly
                    required
                  />
                  <input type="hidden" value={ispb} readOnly />
                  <input
                    className="input-base"
                    placeholder="Agência"
                    value={agency}
                    onChange={(e) => setAgency(e.target.value)}
                    required
                  />
                  <input
                    className="input-base"
                    placeholder="Conta"
                    value={account}
                    onChange={(e) => setAccount(e.target.value)}
                    required
                  />
                  <input
                    className="input-base"
                    placeholder="Dígito"
                    value={accountDigit}
                    onChange={(e) => setAccountDigit(e.target.value)}
                    required
                  />
                  <select
                    className="input-base"
                    value={bankAccountType}
                    onChange={(e) => setBankAccountType(e.target.value)}
                    required
                  >
                    <option value="conta_corrente">Conta Corrente</option>
                    <option value="conta_poupanca">Conta Poupança</option>
                    <option value="conta_salario">Conta Salário</option>
                  </select>
                </div>
              ),
            },
            {
              value: "pix",
              label: "PIX",
              content: (
                <div className="space-y-3">
                  <input
                    className="input-base"
                    placeholder="Chave PIX"
                    value={pixAddressKey}
                    onChange={(e) => setPixAddressKey(e.target.value)}
                    required
                  />
                  <select
                    className="input-base"
                    value={pixAddressKeyType}
                    onChange={(e) => setPixAddressKeyType(e.target.value)}
                    required
                  >
                    <option value="cpf">CPF</option>
                    <option value="email">E-mail</option>
                    <option value="phone">Telefone</option>
                    <option value="random">Aleatória</option>
                  </select>
                  <input
                    className="input-base"
                    placeholder="Descrição"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                  <input
                    className="input-base"
                    type="date"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                  />
                </div>
              ),
            },
          ]}
        />
        {erro && <p className="text-error-600 text-sm">{erro}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary">
            Salvar
          </button>
        </div>
      </form>
    </ModalAnimated>
  );
}
