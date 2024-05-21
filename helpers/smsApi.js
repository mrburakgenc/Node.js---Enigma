const soap = require('soap');

class SmsSenderRequest {
    constructor() {
        this.Username = '';
        this.UserCode = '';
        this.AccountId = '';
        this.Password = '';
        this.Originator = '';
        this.ValidityPeriod = '';
        this.IsCheckBlackList = '';
        this.ChannelCode = '';
        this.ReceiverList = [];
        this.MessageText = '';
    }
}

class SmsSenderResponse {
    constructor() {
        this.Success = false;
        this.Description = '';
    }
}

class SmsSender {
    constructor() {
        this.url = 'https://webservice.asistiletisim.com.tr/SmsProxy.asmx?wsdl';
    }

    async SendSms(number, message) {
        const smsSenderRequest = this.Initialize(number, message);
        const smsSenderResponse = await this.Execute(smsSenderRequest);
        return smsSenderResponse.Description;
    }

    Initialize(number, message) {
        const smsSenderRequest = new SmsSenderRequest();
        smsSenderRequest.Username = '<username>';
        smsSenderRequest.UserCode = '<usercode>';
        smsSenderRequest.Password = '<password>';
        smsSenderRequest.AccountId = '<accountid>';
        smsSenderRequest.ValidityPeriod = '60';
        smsSenderRequest.Originator = '<originator>';
        smsSenderRequest.IsCheckBlackList = '0';

        if (number[0] === '0' && number.length === 11) {
            number = '9' + number;
        } else if (number[0] === '5' && number.length === 10) {
            number = '90' + number;
        }

        smsSenderRequest.ReceiverList.push(number);
        smsSenderRequest.MessageText = message;

        return smsSenderRequest;
    }

    async Execute(smsSenderRequest) {
        try {
            const requestXML = this.GetXML(smsSenderRequest);
            const client = await soap.createClientAsync(this.url);
            const response = await client.sendSmsAsync({ requestXml: requestXML });

            const smsSenderResponse = new SmsSenderResponse();
            if (response.ErrorCode < 0) {
                smsSenderResponse.Success = false;
                smsSenderResponse.Description = 'Hata Kodu: ' + this.GetErrorDescription(response.ErrorCode);
            } else {
                smsSenderResponse.Success = true;
            }

            return smsSenderResponse;
        } catch (error) {
            throw new Error('SMS gönderme işlemi sırasında hata alındı. Hata Mesajı: ' + error.message);
        }
    }

    GetXML(sendSms) {
        const receiverXml = `<Receiver>${sendSms.ReceiverList[0]}</Receiver>`;
        const xml = `<?xml version="1.0" encoding="utf-8"?>
            <SendSms>
                <Username>${sendSms.Username}</Username>
                <UserCode>${sendSms.UserCode}</UserCode>
                <AccountId>${sendSms.AccountId}</AccountId>
                <Password>${sendSms.Password}</Password>
                <Originator>${sendSms.Originator}</Originator>
                <ValidityPeriod>${sendSms.ValidityPeriod}</ValidityPeriod>
                <IsCheckBlackList>${sendSms.IsCheckBlackList}</IsCheckBlackList>
                <ReceiverList>${receiverXml}</ReceiverList>
                <MessageText>${sendSms.MessageText}</MessageText>
            </SendSms>`;
        return xml;
    }

    GetErrorDescription(response) {
        const responseDescription = {
            0: 'NO_ERROR',
            '-1': 'Girilen bilgilere sahip bir kullanıcı bulunamadı',
            '-2': 'Kullanıcı pasif durumda',
            '-3': 'Kullanıcı bloke durumda',
            '-4': 'Kullanıcı hesabı bulunamadı',
            '-5': 'Kullanıcı hesabı pasif durumda',
            '-6': 'Kayıt bulunamadı',
            '-7': 'Hatalı xml istek yapısı',
            '-8': 'Alınan parametrelerden biri veya birkaçı hatalı',
            '-9': 'Prepaid hesap bulunamadı',
            '-10': 'Operatör servisinde geçici kesinti',
            '-11': 'Başlangıç tarihi ile şu an ki zaman arasındaki fark 30 dakikadan az',
            '-12': 'Başlangıç tarihi ile şu an ki zaman arasındaki fark 30 günden fazla',
            '-13': 'Geçersiz gönderici bilgisi',
            '-14': 'Hesaba ait SMS gönderim yetkisi bulunmuyor',
            '-15': 'Mesaj içeriği boş veya limit olan karakter sayısını aşıyor',
            '-16': 'Geçersiz alıcı bilgisi',
            '-17': 'Parametre adetleri ile şablon içerisindeki parametre adedi uyuşmuyor',
            '-18': 'Gönderim içerisinde birden fazla hata mevcut. MessageId kontrol edilmelidir',
            '-19': 'Mükerrer gönderim isteği',
            '-20': 'Bilgilendirme mesajı almak istemiyor',
            '-21': 'Numara karalistede',
            '-22': 'Yetkisiz IP Adresi',
            '-23': 'Kullanıcı yetkisi bulunmamaktadır',
            '-24': 'Belirtilen paket zaten onaylanmıştır',
            '-25': 'Belirtilen Id için onaylanmamış bir paket bulunamadı',
            '-1000': 'SYSTEM_ERROR'
        };
        return responseDescription[response] || 'Bilinmeyen Hata';
    }
}

module.exports = SmsSender;