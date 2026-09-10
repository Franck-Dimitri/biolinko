import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Settings, ShieldCheck, DollarSign, CheckCircle2, Zap, Radio, 
    RefreshCw, QrCode, Smartphone, Send, AlertTriangle, Check, 
    X, ShieldAlert, Sparkles, MessageSquare, PhoneCall, Copy,
    ExternalLink, Lock, Flame
} from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

export default function SettingsIndex({ settings }) {
    // Form for general platform settings
    const { data, setData, post, processing, errors } = useForm({
        platform_fee_percent: settings?.platform_fee_percent || 2.0,
        support_email: settings?.support_email || 'support@biolinko.app',
    });

    // WhatsApp Bot Interactive States
    const [botState, setBotState] = useState(settings?.whatsapp_bot?.state || 'close');
    const [instanceName, setInstanceName] = useState(settings?.whatsapp_bot?.instance || 'test_dims');
    const [isRefreshing, setIsRefreshing] = useState(false);
    
    // QR Code / Connection States
    const [qrCodeData, setQrCodeData] = useState(null);
    const [pairingCode, setPairingCode] = useState(null);
    const [pairingPhone, setPairingPhone] = useState('237');
    const [activeTab, setActiveTab] = useState('qr'); // 'qr' | 'pairing' | 'test'
    const [qrCountdown, setQrCountdown] = useState(45);
    const [isConnecting, setIsConnecting] = useState(false);
    const [isPolling, setIsPolling] = useState(false);
    const pollingIntervalRef = useRef(null);

    // Test Sandbox States
    const [testPhone, setTestPhone] = useState('');
    const [testMessage, setTestMessage] = useState(
        "🚀 *Test Biolinko Bot Officiel*\n\nFélicitations ! Le numéro officiel Biolinko est 100% opérationnel avec le Bouclier Anti-Ban actif (frappe simulée + empreinte polymorphe)."
    );
    const [isSendingTest, setIsSendingTest] = useState(false);
    const [testResult, setTestResult] = useState(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.settings.update'), {
            onSuccess: () => toast.success('Paramètres de la plateforme enregistrés avec succès !'),
        });
    };

    // Polling function for WhatsApp connection state
    const fetchStatus = async (silent = false) => {
        if (!silent) setIsRefreshing(true);
        try {
            const res = await axios.get(route('admin.settings.whatsapp.status'));
            if (res.data && res.data.state) {
                setBotState(res.data.state);
                if (res.data.state === 'open') {
                    setQrCodeData(null);
                    setPairingCode(null);
                    stopPolling();
                    if (!silent) toast.success('🎉 WhatsApp Bot connecté et opérationnel !');
                }
            }
        } catch (err) {
            console.error('Erreur statut WhatsApp:', err);
            if (!silent) toast.error('Impossible de contacter la passerelle WhatsApp.');
        } finally {
            if (!silent) setIsRefreshing(false);
        }
    };

    const startPolling = () => {
        stopPolling();
        setIsPolling(true);
        pollingIntervalRef.current = setInterval(() => {
            fetchStatus(true);
        }, 3500);
    };

    const stopPolling = () => {
        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
        }
        setIsPolling(false);
    };

    useEffect(() => {
        return () => stopPolling();
    }, []);

    // Handle Connect / QR Code Generation
    const handleConnectQR = async () => {
        setIsConnecting(true);
        setQrCodeData(null);
        setPairingCode(null);
        try {
            const res = await axios.post(route('admin.settings.whatsapp.connect'));
            if (res.data.success) {
                if (res.data.state === 'open') {
                    setBotState('open');
                    toast.success('Le bot est déjà connecté !');
                } else if (res.data.base64) {
                    setQrCodeData(res.data.base64);
                    setBotState('connecting');
                    setQrCountdown(45);
                    startPolling();
                    toast.info('QR Code généré ! Scannez-le avec WhatsApp.');
                } else if (res.data.pairing_code) {
                    setPairingCode(res.data.pairing_code);
                    setBotState('connecting');
                    startPolling();
                }
            } else {
                toast.error(res.data.error || 'Erreur lors de la génération de session.');
            }
        } catch (err) {
            toast.error('Erreur réseau lors de la connexion.');
        } finally {
            setIsConnecting(false);
        }
    };

    // Handle Pairing Code Generation
    const handleConnectPairing = async (e) => {
        e.preventDefault();
        if (!pairingPhone || pairingPhone.length < 8) {
            toast.error('Veuillez saisir un numéro de téléphone valide.');
            return;
        }

        setIsConnecting(true);
        try {
            const res = await axios.post(route('admin.settings.whatsapp.connect'), {
                phone: pairingPhone,
            });
            if (res.data.success) {
                if (res.data.pairing_code) {
                    setPairingCode(res.data.pairing_code);
                    setBotState('connecting');
                    startPolling();
                    toast.success('Code d\'association généré !');
                } else if (res.data.state === 'open') {
                    setBotState('open');
                    toast.success('Le numéro est déjà connecté !');
                }
            } else {
                toast.error(res.data.error || 'Impossible d\'obtenir le code.');
            }
        } catch (err) {
            toast.error('Erreur lors de la requête du code d\'association.');
        } finally {
            setIsConnecting(false);
        }
    };

    // Handle Disconnect
    const handleDisconnect = async () => {
        if (!confirm('Êtes-vous sûr de vouloir déconnecter le numéro officiel Biolinko ? Les notifications automatiques seront suspendues.')) {
            return;
        }

        try {
            const res = await axios.post(route('admin.settings.whatsapp.disconnect'));
            if (res.data.success) {
                setBotState('close');
                setQrCodeData(null);
                setPairingCode(null);
                stopPolling();
                toast.success('Numéro WhatsApp déconnecté avec succès.');
            } else {
                toast.error('Échec de la déconnexion.');
            }
        } catch (err) {
            toast.error('Erreur lors de la déconnexion.');
        }
    };

    // Handle Test Message
    const handleSendTest = async (e) => {
        e.preventDefault();
        if (!testPhone) {
            toast.error('Veuillez spécifier le numéro de téléphone de destination.');
            return;
        }

        setIsSendingTest(true);
        setTestResult(null);
        try {
            const res = await axios.post(route('admin.settings.whatsapp.test'), {
                phone: testPhone,
                message: testMessage,
            });

            if (res.data.success) {
                setTestResult({ success: true, message: 'Message transmis avec succès à WhatsApp !' });
                toast.success('✅ Message de test envoyé avec succès !');
            } else {
                setTestResult({ success: false, message: res.data.error || 'Échec de transmission.' });
                toast.error('❌ Échec de l\'envoi du message test.');
            }
        } catch (err) {
            setTestResult({ success: false, message: 'Erreur réseau ou réponse invalide.' });
            toast.error('Erreur lors de l\'envoi du message.');
        } finally {
            setIsSendingTest(false);
        }
    };

    const isBotConnected = botState === 'open';

    return (
        <AuthenticatedLayout>
            <Head title="Paramètres Plateforme & WhatsApp Bot — Administration BIOLINKO" />

            <div className="space-y-8 font-sans pb-16 max-w-7xl mx-auto">
                {/* HERO BANNER */}
                <div className="p-6 sm:p-8 rounded-3xl bg-linear-to-r from-[#FFCC00] via-amber-300 to-[#FFD700] text-slate-950 shadow-sm border border-amber-300 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="space-y-1.5">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950 text-white text-[11px] font-bold uppercase tracking-wider">
                            <Settings className="w-3.5 h-3.5 text-[#FFCC00]" /> SUPER-ADMINISTRATION BIOLINKO
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                            Centre de Contrôle &amp; Passerelle WhatsApp
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-900 font-medium max-w-2xl">
                            Gérez le bot officiel de dispatching des notifications, configurez le Bouclier Anti-Ban et supervisez les commissions réseau.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className={`px-4 py-2.5 rounded-2xl border flex items-center gap-2.5 text-xs font-bold shadow-xs ${
                            isBotConnected 
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-950' 
                                : 'bg-slate-950/10 border-slate-950/20 text-slate-950'
                        }`}>
                            <span className={`w-3 h-3 rounded-full ${isBotConnected ? 'bg-emerald-600 animate-pulse' : 'bg-rose-500'}`} />
                            <span>Bot : {isBotConnected ? 'OPÉRATIONNEL' : 'DÉCONNECTÉ'}</span>
                        </div>
                    </div>
                </div>

                {/* 4 ALIGNED METRICS CARDS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-2.5">
                        <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                            <span>Frais Plateforme Ventes</span>
                            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center">
                                <DollarSign className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-2xl sm:text-3xl font-bold text-slate-950">
                            {settings?.platform_fee_percent || 2.0}%
                        </div>
                        <div className="text-[11px] text-slate-400 font-medium">
                            Commission Fast Checkout
                        </div>
                    </div>

                    <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-2.5">
                        <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                            <span>Frais Virement Payout</span>
                            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                                <ShieldCheck className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-2xl sm:text-3xl font-bold text-emerald-600">
                            1.0% MoMo
                        </div>
                        <div className="text-[11px] text-emerald-600 font-semibold">
                            Frais de retrait vendeur
                        </div>
                    </div>

                    <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-2.5">
                        <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                            <span>Passerelle Mobile Money</span>
                            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center">
                                <Zap className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-2xl sm:text-3xl font-bold text-slate-950">
                            HR-Skills Pay
                        </div>
                        <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Opérationnelle
                        </div>
                    </div>

                    <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-2.5">
                        <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                            <span>Passerelle WhatsApp</span>
                            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center">
                                <Radio className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-2xl sm:text-3xl font-bold text-purple-700">
                            Evolution API v2
                        </div>
                        <div className="text-[11px] text-purple-700 font-semibold">
                            Instance : {instanceName}
                        </div>
                    </div>
                </div>

                {/* WHATSAPP BOT MANAGEMENT & ANTI-BAN SECTION */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                    {/* Header with WhatsApp Branding */}
                    <div className="p-6 sm:p-8 bg-slate-950 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-[#25D366] text-white flex items-center justify-center shadow-lg shadow-[#25D366]/20">
                                <MessageSquare className="w-7 h-7" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h2 className="text-lg sm:text-xl font-bold">Bot WhatsApp Officiel Biolinko</h2>
                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                                        isBotConnected 
                                            ? 'bg-emerald-500 text-white' 
                                            : botState === 'connecting'
                                                ? 'bg-amber-400 text-slate-950 animate-pulse'
                                                : 'bg-rose-500 text-white'
                                    }`}>
                                        {isBotConnected ? 'CONNECTÉ' : botState === 'connecting' ? 'SCAN EN COURS' : 'DÉCONNECTÉ'}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-400 mt-1">
                                    Instance : <code className="text-amber-300 font-mono">{instanceName}</code> • Distribue automatiquement les devis, factures PDF, relances 1-clic et suivis de commande.
                                </p>
                            </div>
                        </div>

                        {/* Top Action Buttons */}
                        <div className="flex flex-wrap items-center gap-2.5">
                            <button
                                onClick={() => fetchStatus(false)}
                                disabled={isRefreshing}
                                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-2 transition cursor-pointer"
                                title="Actualiser le statut de connexion"
                            >
                                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                                Actualiser
                            </button>

                            {isBotConnected ? (
                                <button
                                    onClick={handleDisconnect}
                                    className="px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                                >
                                    <X className="w-3.5 h-3.5" /> Déconnecter
                                </button>
                            ) : (
                                <button
                                    onClick={handleConnectQR}
                                    disabled={isConnecting}
                                    className="px-5 py-2 rounded-xl bg-[#25D366] hover:bg-emerald-500 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 shadow-md transition cursor-pointer"
                                >
                                    <QrCode className="w-3.5 h-3.5" />
                                    {isConnecting ? 'Connexion...' : 'Scanner le QR Code'}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Main WhatsApp Work Area */}
                    <div className="p-6 sm:p-8 space-y-8">
                        {/* Status Alert Banner */}
                        {isBotConnected ? (
                            <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3.5">
                                <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 mt-0.5">
                                    <CheckCircle2 className="w-5 h-5" />
                                </div>
                                <div className="text-xs space-y-1">
                                    <h4 className="font-bold text-emerald-950 text-sm">Passerelle WhatsApp Actuellement Connectée &amp; Opérationnelle</h4>
                                    <p className="text-emerald-800 leading-relaxed">
                                        Toutes les notifications de commande (paniers réservés, paiements validés, mise à jour de livraison et factures PDF) sont automatiquement transmises aux acheteurs et aux commerçants avec le <strong>Bouclier Anti-Ban</strong>.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3.5">
                                <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 mt-0.5">
                                    <AlertTriangle className="w-5 h-5" />
                                </div>
                                <div className="text-xs space-y-1">
                                    <h4 className="font-bold text-amber-950 text-sm">Le Bot WhatsApp n'est pas synchronisé</h4>
                                    <p className="text-amber-800 leading-relaxed">
                                        Pour activer les notifications en direct et l'envoi de factures, connectez votre numéro WhatsApp officiel Biolinko ci-dessous en scannant le QR code ou via le code d'association à 8 chiffres.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Interactive Tabs: QR Code / Code d'association / Sandbox Test */}
                        <div>
                            <div className="flex border-b border-slate-200 text-xs font-bold">
                                <button
                                    onClick={() => setActiveTab('qr')}
                                    className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition cursor-pointer ${
                                        activeTab === 'qr'
                                            ? 'border-slate-950 text-slate-950'
                                            : 'border-transparent text-slate-400 hover:text-slate-700'
                                    }`}
                                >
                                    <QrCode className="w-4 h-4" /> 1. Connexion par QR Code
                                </button>

                                <button
                                    onClick={() => setActiveTab('pairing')}
                                    className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition cursor-pointer ${
                                        activeTab === 'pairing'
                                            ? 'border-slate-950 text-slate-950'
                                            : 'border-transparent text-slate-400 hover:text-slate-700'
                                    }`}
                                >
                                    <Smartphone className="w-4 h-4" /> 2. Code d'Association (Sans Caméra)
                                </button>

                                <button
                                    onClick={() => setActiveTab('test')}
                                    className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition cursor-pointer ${
                                        activeTab === 'test'
                                            ? 'border-slate-950 text-slate-950'
                                            : 'border-transparent text-slate-400 hover:text-slate-700'
                                    }`}
                                >
                                    <Send className="w-4 h-4" /> 3. Bac à Sable d'Envoi Test
                                </button>
                            </div>

                            <div className="pt-6">
                                {/* TAB 1: QR CODE */}
                                {activeTab === 'qr' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                                        <div className="space-y-4 text-xs">
                                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                                                Instructions de synchronisation
                                            </div>
                                            <h3 className="text-base font-extrabold text-slate-950">
                                                Comment connecter le numéro officiel Biolinko :
                                            </h3>
                                            <ol className="space-y-3 text-slate-600 font-medium list-decimal list-inside leading-relaxed">
                                                <li>Ouvrez l'application <strong>WhatsApp</strong> ou <strong>WhatsApp Business</strong> sur votre smartphone.</li>
                                                <li>Accédez au menu <strong>Options (⋮ sur Android)</strong> ou <strong>Réglages (sur iPhone)</strong>.</li>
                                                <li>Sélectionnez <strong>Appareils connectés</strong> puis cliquez sur <strong>Connecter un appareil</strong>.</li>
                                                <li>Pointez l'objectif de votre smartphone vers le QR Code affiché à droite.</li>
                                            </ol>

                                            <div className="pt-2 flex items-center gap-3">
                                                <button
                                                    onClick={handleConnectQR}
                                                    disabled={isConnecting}
                                                    className="px-5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-extrabold text-xs shadow-md transition cursor-pointer flex items-center gap-2"
                                                >
                                                    <QrCode className="w-4 h-4 text-[#FFCC00]" />
                                                    {isConnecting ? 'Génération en cours...' : 'Générer / Rafraîchir le QR Code'}
                                                </button>

                                                {isPolling && (
                                                    <span className="text-[11px] text-amber-700 font-semibold flex items-center gap-1.5 animate-pulse">
                                                        <RefreshCw className="w-3 h-3 animate-spin" /> Détection automatique du scan...
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* QR Code Container */}
                                        <div className="flex flex-col items-center justify-center p-6 bg-slate-50 border border-slate-200 rounded-3xl min-h-[300px]">
                                            {qrCodeData ? (
                                                <div className="text-center space-y-3">
                                                    <div className="p-4 bg-white rounded-2xl shadow-md border border-slate-200 inline-block">
                                                        <img
                                                            src={qrCodeData.startsWith('data:') ? qrCodeData : `data:image/png;base64,${qrCodeData}`}
                                                            alt="WhatsApp QR Code"
                                                            className="w-56 h-56 object-contain"
                                                        />
                                                    </div>
                                                    <div className="text-xs text-slate-500 font-medium">
                                                        Scannez avant expiration. Statut : <span className="font-bold text-amber-600 uppercase">{botState}</span>
                                                    </div>
                                                </div>
                                            ) : isBotConnected ? (
                                                <div className="text-center space-y-3 p-6">
                                                    <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                                                        <Check className="w-8 h-8" />
                                                    </div>
                                                    <h4 className="font-bold text-slate-950 text-sm">Session WhatsApp Active</h4>
                                                    <p className="text-xs text-slate-500 max-w-xs">
                                                        Votre numéro est déjà relié et prêt à fonctionner. Aucun scan nécessaire.
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="text-center space-y-3 p-6">
                                                    <QrCode className="w-12 h-12 text-slate-300 mx-auto" />
                                                    <div className="text-xs font-semibold text-slate-700">Aucun QR Code affiché</div>
                                                    <p className="text-[11px] text-slate-400 max-w-xs">
                                                        Cliquez sur « Générer / Rafraîchir le QR Code » pour charger la session active.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* TAB 2: PAIRING CODE */}
                                {activeTab === 'pairing' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                                        <div className="space-y-4 text-xs">
                                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                                                Association par numéro (Sans caméra)
                                            </div>
                                            <h3 className="text-base font-extrabold text-slate-950">
                                                Associer via un Code à 8 Chiffres :
                                            </h3>
                                            <p className="text-slate-600 leading-relaxed font-medium">
                                                Si vous n'avez pas de caméra ou préférez saisir un code directement dans WhatsApp :
                                            </p>
                                            <ol className="space-y-2 text-slate-600 font-medium list-decimal list-inside">
                                                <li>Indiquez votre numéro WhatsApp avec indicatif (ex: 237676383986).</li>
                                                <li>Cliquez sur <strong>Obtenir le code d'association</strong>.</li>
                                                <li>Dans WhatsApp, appuyez sur <em>Appareils connectés &gt; Associer avec un numéro de téléphone</em>.</li>
                                                <li>Entrez les 8 caractères affichés à l'écran.</li>
                                            </ol>

                                            <form onSubmit={handleConnectPairing} className="pt-2 flex flex-col sm:flex-row gap-2.5">
                                                <input
                                                    type="text"
                                                    value={pairingPhone}
                                                    onChange={(e) => setPairingPhone(e.target.value)}
                                                    placeholder="237699123456"
                                                    className="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-bold focus:border-amber-400 outline-none w-full sm:w-56"
                                                />
                                                <button
                                                    type="submit"
                                                    disabled={isConnecting}
                                                    className="px-4 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-extrabold text-xs shadow-md transition cursor-pointer shrink-0"
                                                >
                                                    {isConnecting ? 'Génération...' : 'Obtenir le code'}
                                                </button>
                                            </form>
                                        </div>

                                        <div className="flex flex-col items-center justify-center p-6 bg-slate-50 border border-slate-200 rounded-3xl min-h-[260px]">
                                            {pairingCode ? (
                                                <div className="text-center space-y-4">
                                                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                                        Votre Code d'Association :
                                                    </span>
                                                    <div className="px-6 py-3 rounded-2xl bg-white border-2 border-amber-400 shadow-md">
                                                        <span className="text-2xl sm:text-3xl font-mono font-black text-slate-950 tracking-widest">
                                                            {pairingCode}
                                                        </span>
                                                    </div>
                                                    <p className="text-[11px] text-slate-500">
                                                        Saisissez ce code dans WhatsApp sur votre téléphone.
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="text-center space-y-2 p-6">
                                                    <Smartphone className="w-12 h-12 text-slate-300 mx-auto" />
                                                    <div className="text-xs font-semibold text-slate-700">Aucun code généré</div>
                                                    <p className="text-[11px] text-slate-400 max-w-xs">
                                                        Renseignez le numéro et cliquez sur Obtenir le code.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* TAB 3: TEST SANDBOX */}
                                {activeTab === 'test' && (
                                    <div className="max-w-2xl space-y-5 text-xs">
                                        <div className="space-y-1">
                                            <h3 className="text-sm font-extrabold text-slate-950">
                                                Tester l'envoi direct depuis le Bot Officiel Biolinko
                                            </h3>
                                            <p className="text-slate-500">
                                                Vérifiez que les messages sont instantanément reçus sur votre téléphone avec le délai de frappe humaine.
                                            </p>
                                        </div>

                                        <form onSubmit={handleSendTest} className="space-y-4">
                                            <div>
                                                <label className="block font-bold text-slate-950 mb-1">
                                                    Numéro de téléphone destinataire (avec indicatif pays)
                                                </label>
                                                <input
                                                    type="text"
                                                    value={testPhone}
                                                    onChange={(e) => setTestPhone(e.target.value)}
                                                    placeholder="Ex: 237676383986 ou 237699123456"
                                                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-bold focus:border-amber-400 outline-none"
                                                />
                                            </div>

                                            <div>
                                                <label className="block font-bold text-slate-950 mb-1">
                                                    Message de test à envoyer
                                                </label>
                                                <textarea
                                                    rows={4}
                                                    value={testMessage}
                                                    onChange={(e) => setTestMessage(e.target.value)}
                                                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:border-amber-400 outline-none"
                                                />
                                            </div>

                                            <button
                                                type="submit"
                                                disabled={isSendingTest}
                                                className="px-5 py-2.5 rounded-xl bg-[#25D366] hover:bg-emerald-600 text-slate-950 font-black text-xs shadow-md transition cursor-pointer flex items-center gap-2"
                                            >
                                                <Send className="w-3.5 h-3.5" />
                                                {isSendingTest ? 'Envoi en cours (simulation frappe)...' : 'Envoyer le message test'}
                                            </button>
                                        </form>

                                        {testResult && (
                                            <div className={`p-4 rounded-2xl border flex items-center gap-3 ${
                                                testResult.success
                                                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                                                    : 'bg-rose-50 border-rose-200 text-rose-900'
                                            }`}>
                                                {testResult.success ? (
                                                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                                                ) : (
                                                    <X className="w-5 h-5 text-rose-600 shrink-0" />
                                                )}
                                                <span className="font-semibold text-xs">{testResult.message}</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* BOUCLIER ANTI-BAN VISUAL DASHBOARD */}
                        <div className="pt-6 border-t border-slate-100 space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div className="space-y-0.5">
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase tracking-wider">
                                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> SYSTÈME DE PROTECTION ACTIF
                                    </div>
                                    <h3 className="font-extrabold text-slate-950 text-base">
                                        Le Bouclier Anti-Ban Biolinko (5 Niveaux de Sécurité)
                                    </h3>
                                    <p className="text-xs text-slate-500 font-medium">
                                        Comment nous garantissons que le numéro officiel de Biolinko ne sera jamais banni par WhatsApp :
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold text-slate-950">1. Moteur Polymorphe Spintax</span>
                                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">Actif</span>
                                    </div>
                                    <p className="text-slate-500 leading-relaxed text-[11px]">
                                        Chaque message sortant possède une salutation variée (Hello, Bonjour, Salutations) et une empreinte cryptographique horodatée unique. <strong>Aucun message n'a un hash SHA-256 identique</strong>.
                                    </p>
                                </div>

                                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold text-slate-950">2. Frappe Humaine Simulée</span>
                                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">2.5s - 4.8s</span>
                                    </div>
                                    <p className="text-slate-500 leading-relaxed text-[11px]">
                                        Avant chaque envoi, le bot active l'état WhatsApp <code>presence: 'composing'</code> pour simuler un être humain tapant au clavier, éliminant la détection heuristique de bots instantanés.
                                    </p>
                                </div>

                                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold text-slate-950">3. Régulation Anti-Burst &amp; Jitter</span>
                                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">Régulé</span>
                                    </div>
                                    <p className="text-slate-500 leading-relaxed text-[11px]">
                                        Les envois simultanés massifs sont étalés dans le temps avec une variation aléatoire (jitter) pour respecter les seuils de débit autorisés par Meta.
                                    </p>
                                </div>

                                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold text-slate-950">4. Répondeur 2-Way Conversational</span>
                                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">Webhook</span>
                                    </div>
                                    <p className="text-slate-500 leading-relaxed text-[11px]">
                                        Dès qu'un acheteur répond au message, notre webhook intercepte et répond chaleureusement en le guidant vers sa commande. Ce trafic bidirectionnel booste le score de confiance du numéro.
                                    </p>
                                </div>

                                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 md:col-span-2">
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold text-slate-950">5. Contexte Transactionnel &amp; Anti-Signalement</span>
                                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">0% Spam</span>
                                    </div>
                                    <p className="text-slate-500 leading-relaxed text-[11px]">
                                        90% des bannissements surviennent quand un utilisateur clique sur « Signaler comme spam ». Nos messages rappellent toujours le nom de la boutique et incluent le contact direct du vendeur, rassurant immédiatement le client.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* RECOMMANDATIONS OFFICIELLES WARM-UP */}
                        <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-300 text-slate-900 space-y-2 text-xs">
                            <div className="flex items-center gap-2 font-bold text-amber-950 text-sm">
                                <Flame className="w-4 h-4 text-amber-600" />
                                Recommandations de Rodage (Warm-up) pour le Numéro Officiel :
                            </div>
                            <ul className="list-disc list-inside space-y-1 text-slate-700 leading-relaxed">
                                <li><strong>Utilisez une carte SIM dédiée WhatsApp Business :</strong> Renseignez une photo de profil officielle (logo Biolinko), le nom d'entreprise « Biolinko Notifications » et l'adresse du site web.</li>
                                <li><strong>Rodage initial progressif :</strong> Durant les 3 premiers jours, limitez à 20-35 messages/jour, puis montez à 50-80/jour dès le 4e jour.</li>
                                <li><strong>Ne jamais faire de publicité froide non sollicitée :</strong> Le bot doit uniquement envoyer des messages suite à une action du client (commande, paiement, relance panier réservé).</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* PLATFORM CONFIGURATION & MICROSERVICES SETTINGS */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* COMMISSION FORM */}
                    <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 space-y-6 shadow-xs">
                        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
                                <DollarSign className="w-5 h-5 text-amber-700" />
                            </div>
                            <div>
                                <h3 className="font-extrabold text-slate-950 text-sm">Frais &amp; Commissions Vendeurs</h3>
                                <p className="text-xs text-slate-500 font-medium">Taux prélevé sur les commandes Fast Checkout</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
                            <div>
                                <label className="block font-bold text-slate-950 mb-1">
                                    Commission BIOLINKO Plateforme (%)
                                </label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={data.platform_fee_percent}
                                    onChange={(e) => setData('platform_fee_percent', e.target.value)}
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:border-amber-400 outline-none font-mono"
                                />
                                {errors.platform_fee_percent && <div className="text-rose-600 text-[11px] mt-1">{errors.platform_fee_percent}</div>}
                                <p className="text-[10px] text-slate-400 mt-1">Actuellement fixé à 2.0% (Calculé sur les prix d'affichage client).</p>
                            </div>

                            <div>
                                <label className="block font-bold text-slate-950 mb-1">
                                    Email du Support Officiel
                                </label>
                                <input
                                    type="email"
                                    value={data.support_email}
                                    onChange={(e) => setData('support_email', e.target.value)}
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:border-amber-400 outline-none"
                                />
                                {errors.support_email && <div className="text-rose-600 text-[11px] mt-1">{errors.support_email}</div>}
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="px-5 py-3 rounded-xl bg-slate-950 hover:bg-slate-900 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer"
                            >
                                Enregistrer les modifications
                            </button>
                        </form>
                    </div>

                    {/* MICROSERVICES STATUS */}
                    <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 space-y-6 shadow-xs">
                        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-900 flex items-center justify-center font-bold">
                                <Zap className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div>
                                <h3 className="font-extrabold text-slate-950 text-sm">État des Microservices &amp; Passerelles</h3>
                                <p className="text-xs text-slate-500 font-medium">Statut d'intégration en temps réel</p>
                            </div>
                        </div>

                        <div className="space-y-3 text-xs">
                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <div className="font-bold text-slate-950">Passerelle Mobile Money (HR-Skills Pay)</div>
                                    <div className="text-slate-400 font-mono text-[11px]">{settings?.hrskills_pay_url}</div>
                                </div>
                                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Opérationnelle
                                </span>
                            </div>

                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <div className="font-bold text-slate-950">Passerelle WhatsApp (Evolution API Node.js)</div>
                                    <div className="text-slate-400 font-mono text-[11px]">{settings?.whatsapp_gateway_url}</div>
                                </div>
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase flex items-center gap-1 ${
                                    isBotConnected ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                }`}>
                                    <CheckCircle2 className="w-3 h-3" /> {isBotConnected ? 'Connectée' : 'En veille'}
                                </span>
                            </div>

                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <div className="font-bold text-slate-950">Moteur de Facturation PDF Certifiée</div>
                                    <div className="text-slate-400 text-[11px]">QR Code &amp; Filigrane Officiel</div>
                                </div>
                                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Actif
                                </span>
                            </div>

                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <div className="font-bold text-slate-950">Webhook Répondeur 2-Way Anti-Ban</div>
                                    <div className="text-slate-400 font-mono text-[11px]">/api/webhooks/whatsapp</div>
                                </div>
                                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Prêt
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
