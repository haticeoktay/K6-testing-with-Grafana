# running distributed load tests on kubernetes (k6)
**1.    Grafana**

Test ortamında default namespace altında grafana kurulumu gerçekleştirildi.

Kullanıcı adı: admin

Parola : parola

**2.  Writing test script**

Test senaryosunu içeren bir Config Map oluşturulması gerekiyor. Operatörün senaryoyu alması için dosyayı test.js olarak adlandırmamız gerekiyor. Aşağıdaki test senaryosu kullanılacaktır:

test-something-withstages.js

**Test scriptini lokalde denemek için kullanılan komut;**

(info)  k6 run create-device-with-stages.js

stages kısmı senaryonun zaman içinde nasıl değişeceğini belirler. Her bir stage bir bölümü temsil eder ve her bir bölümde belirli bir hedefe ulaşmak için ne kadar süre ve hangi hızda isteklerin gönderileceğini belirtir.



Stages kısmı:

İlk 10 saniye boyunca her saniye 10 istek gönderilir ve toplam 100 istek yapılır.

Sonraki 90 saniye boyunca her saniye 10 istek gönderilir ve toplamda 1000 istek tamamlanmış olur.

Bu stages dizisi, belirli bir süre boyunca isteklerin hedeflenen sayısını ve hızını ayarlayarak yük testinin kontrollü bir şekilde yapılmasını sağlar. Bu, belirli bir yük altında sistem davranışının nasıl olduğunu gözlemlemek için kullanışlıdır.

**3.    Deploying test script**

Config Map adı istediğiniz herhangi bir şey olabilir, ancak bu demoda k6-test-create-something kullanacağız.

ConfigMap ile test scriptinin kubernetes ortamına aktarılması aşağıdaki komut ile gerçekleştirilebilir.
      
      
      (info) kubectl create configmap k6-test-create-something --from-file k6-create-something/test-create-something-2.js

      configmap/k6-test-create-device2 created

      ![image](https://github.com/haticeoktay/K6-testing-with-Grafana/assets/65062246/04958ad7-ade0-4812-823b-67a5d00ec74a)


** 4.    Creating custom resource (CR)**

Operatörle iletişim kurmak için K6 adında özel bir kaynak kullanılır. Custom resource’lar, tamamen özelleştirilebilir olmakla birlikte tıpkı yerel Kubernetes nesneleri gibi davranır.[1] Bu durumda, özel kaynağın verileri k6 operatörünün dağıtılmış yük testini başlatabilmesi için gerekli tüm bilgileri içerir:


(info) test-create-something2.yaml

apiVersion: k6.io/v1alpha1
kind: K6
metadata:
  name: k6-create-device-test-2
spec:
  parallelism: 2
  script:
    configMap:
      name: "k6-test-create-device2"
      file: "test-create-device-with-stages.js"
  arguments: --out influxdb=http://influxdb:8086/k6

  Testi koşturmak için test-create-device.yaml dosyası aşağıdaki komut ile çağırılarak test tetiklenebilir.


(info) kubectl apply -f test-create-device2.yaml

![image](https://github.com/haticeoktay/K6-testing-with-Grafana/assets/65062246/90f09946-28e2-4e9b-b9c2-49ad63b6d2af)

checks: Testinizde tanımladığınız koşulları karşılayan ve karşılamayan isteklerin yüzdesi. Örneğin, checks: 33.33% ✓ 730 ✗ 1460, testinizdeki isteklerin %33.33’ünün başarılı olduğunu, geri kalanının başarısız olduğunu gösterir.

data_received: Test süresince alınan veri miktarı ve hızı. Örneğin, data_received: 2.5 MB 4.0 kB/s, testinizin toplamda 2.5 MB veri aldığını ve ortalama 4.0 kB/s hızında olduğunu gösterir.
data_sent: Test süresince gönderilen veri miktarı ve hızı. Örneğin, data_sent: 152 kB 241 B/s, testinizin toplamda 152 kB veri gönderdiğini ve ortalama 241 B/s hızında olduğunu gösterir.

http_req_blocked: İsteklerin ağa çıkmasını engelleyen faktörlerin (DNS araması, TLS el sıkışması, vb.) neden olduğu gecikme süresi. Örneğin, http_req_blocked: avg=2.5ms min=0s med=0s max=1.82s p(90)=0s p(95)=0s, testinizdeki isteklerin ortalama 2.5 ms, en fazla 1.82 s bloke olduğunu, %90’ının hiç bloke olmadığını, %95’inin ise en fazla 0 s bloke olduğunu gösterir.

http_req_connecting: İsteklerin sunucuya bağlanmak için harcadığı süre. Örneğin, http_req_connecting: avg=2.41ms min=0s med=0s max=1.76s p(90)=0s p(95)=0s, testinizdeki isteklerin ortalama 2.41 ms, en fazla 1.76 s bağlanmak için harcadığını, %90’ının hiç bağlanma süresi olmadığını, %95’inin ise en fazla 0 s bağlanma süresi olduğunu gösterir.

http_req_duration: İsteklerin baştan sona kadar sürdüğü süre (toplam gecikme). Örneğin, http_req_duration: avg=751.8ms min=672.36ms med=725.27ms max=1.72s p(90)=821.66ms p(95)=877.38ms, testinizdeki isteklerin ortalama 751.8 ms, en az 672.36 ms, en fazla 1.72 s sürdüğünü, %90’ının 821.66 ms’den daha az, %95’inin ise 877.38 ms’den daha az sürdüğünü gösterir.

http_req_failed: Başarısız olan isteklerin yüzdesi. Örneğin, http_req_failed: 0.00% ✓ 0 ✗ 730, testinizdeki hiçbir isteğin başarısız olmadığını gösterir.

http_req_sending: İsteklerin gönderilmesi için harcanan süre. Örneğin, http_req_sending: avg=34.67µs min=0s med=0s max=10.15ms p(90)=39.45µs p(95)=161.75µs, testinizdeki isteklerin ortalama 34.67 µs, en fazla 10.15 ms göndermek için harcadığını, %90’ının 39.45 µs’den daha az, %95’inin ise 161.75 µs’den daha az göndermek için harcadığını gösterir.

http_req_waiting: İsteklerin sunucudan yanıt beklemesi için harcanan süre. Örneğin, http_req_waiting: avg=751.44ms min=672.36ms med=724.92ms max=1.72s p(90)=821.03ms p(95)=876.82ms, testinizdeki isteklerin ortalama 751.44 ms, en az 672.36 ms, en fazla 1.72 s beklediğini, %90’ının 821.03 ms’den daha az, %95’inin ise 876.82 ms’den daha az beklediğini gösterir.

vus: Test sırasında kullanılan sanal kullanıcı sayısı. Örneğin, vus: 1 min=1 max=1, testinizde sadece 1 sanal kullanıcı kullandığınızı gösterir.

vus_max: Test sırasında kullanılabilecek maksimum sanal kullanıcı sayısı. Örneğin, vus_max: 1 min=1 max=1, testinizde en fazla 1 sanal kullanıcı kullanabileceğinizi gösterir.
Bu metrikleri yorumlamak için, testinizin amacına, senaryosuna ve beklentilerinize bağlı olarak farklı değerlere odaklanabilirsiniz. Örneğin, testinizin performansını ölçmek istiyorsanız, http_req_duration, http_req_failed, http_req_waiting gibi metrikleri takip edebilirsiniz. Testinizin yükünü ölçmek istiyorsanız, data_received, data_sent, vus, vus_max gibi metrikleri takip edebilirsiniz. Testinizin doğruluğunu ölçmek istiyorsanız, checks, http_req_failed, http_req_blocked gibi metrikleri takip edebilirsiniz.
k6 test sonuçlarını görselleştirmek için farklı yöntemler ve araçlar kullanabilirsiniz. Örneğin, test sonunda konsolda basit bir özet rapor alabilirsiniz1. Ya da test sırasında metrikleri gerçek zamanlı olarak bir JSON veya CSV dosyasına yazdırabilirsiniz2. Veya metrikleri bir dış servise akıtabilir ve grafikler, tablolar, göstergeler gibi farklı şekillerde görüntüleyebilirsiniz3. k6’nın desteklediği dış servisler arasında Grafana, InfluxDB, Prometheus, Datadog, Elasticsearch, TimescaleDB, StatsD ve daha fazlası bulunmaktadır.


Referanslar:

https://grafana.com/blog/2022/06/23/running-distributed-load-tests-on-kubernetes/


